

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE EXTENSION IF NOT EXISTS "pg_cron" WITH SCHEMA "pg_catalog";






COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "hypopg" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "index_advisor" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pg_trgm" WITH SCHEMA "public";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgjwt" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "wrappers" WITH SCHEMA "extensions";






CREATE TYPE "public"."Roles" AS ENUM (
    'admin',
    'user',
    'shopkeeper'
);


ALTER TYPE "public"."Roles" OWNER TO "postgres";


COMMENT ON TYPE "public"."Roles" IS 'Roles';



CREATE OR REPLACE FUNCTION "public"."@user"("username" "text") RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    usr jsonb;
    role_row jsonb;
BEGIN
    -- 1. Fetch full user by username
    SELECT to_jsonb(u.*)
    INTO usr
    FROM public.users u
    WHERE u.username = user_profile.username;

    IF usr IS NULL THEN
        RETURN jsonb_build_object(
            'user', null,
            'navigation', '[]'::jsonb,
            'command', null,
            'tabs', '[]'::jsonb
        );
    END IF;

    -- 2. Fetch role metadata from roles table
    SELECT jsonb_build_object(
        'navigation', COALESCE(r.navigation, '[]'::jsonb),
        'command', r.command,
        'tabs', COALESCE(r.tabs, '[]'::jsonb)
    )
    INTO role_row
    FROM public.roles r
    WHERE r.id = (usr->>'role')::bigint;

    RETURN jsonb_build_object(
        'user', usr,
        'navigation', role_row->'navigation',
        'command', role_row->'command',
        'tabs', role_row->'tabs'
    );
END;
$$;


ALTER FUNCTION "public"."@user"("username" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."add_transaction_secure"("p_user_phone" "text", "p_amount" numeric, "p_type" "text", "p_mode" "text", "p_notes" "text" DEFAULT NULL::"text") RETURNS "uuid"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  v_auth_id uuid;
  v_seller_id uuid;
  v_user_id uuid;
  v_id uuid;
  v_permissions text[];
BEGIN
  -- Resolve the logged-in Supabase auth user first.
  v_auth_id := auth.uid();

  IF v_auth_id IS NULL THEN
    RAISE EXCEPTION 'Unauthorized: no valid session found';
  END IF;

  -- 🔥 Step 2: Resolve seller permanent ID
  SELECT id INTO v_seller_id
  FROM public.users
  WHERE auth_id = v_auth_id
  LIMIT 1;

  IF v_seller_id IS NULL THEN
    RAISE EXCEPTION 'Seller not found for auth user %', v_auth_id;
  END IF;

  -- Permission lookup starts from auth.uid() and resolves through users.auth_id.
  SELECT array_agg(permission_key)
  INTO v_permissions
  FROM get_user_permissions(v_auth_id);

  IF v_permissions IS NULL OR NOT ('create:transaction' = ANY(v_permissions)) THEN
    RAISE EXCEPTION 'Permission denied: missing create:transaction permission';
  END IF;

  -- Step 4: Validate input
  IF p_type NOT IN ('credit', 'debit') THEN
    RAISE EXCEPTION 'Invalid type: must be credit or debit';
  END IF;

  IF p_amount <= 0 THEN
    RAISE EXCEPTION 'Amount must be greater than zero';
  END IF;

  -- 🔥 Step 5: Resolve buyer permanent ID
  SELECT id INTO v_user_id
  FROM public.users
  WHERE phone = p_user_phone
  LIMIT 1;

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User not found';
  END IF;

  -- 🔥 Step 6: Insert transaction with correct IDs
  INSERT INTO public.transactions (
    user_id,
    "userPhone",
    "sellerID",
    amount,
    type,
    mode,
    notes
  )
  VALUES (
    v_user_id,
    p_user_phone,
    v_seller_id,
    p_amount,
    p_type,
    p_mode,
    p_notes
  )
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$$;


ALTER FUNCTION "public"."add_transaction_secure"("p_user_phone" "text", "p_amount" numeric, "p_type" "text", "p_mode" "text", "p_notes" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."addproduct"("payload" "jsonb") RETURNS "uuid"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
declare
  _seller_id uuid := auth.uid();
  _product_id uuid;
  _variant jsonb;
  _slug text;
  _name text := trim(payload->>'name');
  _category text := trim(payload->>'category');
  _thumbnail text := nullif(trim(payload->>'thumbnail'), '');
begin
  -- ✅ Permission check directly via get_user_permissions
  if not exists (
    select 1
    from get_user_permissions(_seller_id)
    where permission_key = 'create:product'
  ) then
    raise exception 'Permission denied: create:product';
  end if;

  -- ✅ Validate inputs
  if _name is null or _name = '' then
    raise exception 'Product name is required';
  end if;

  if _category is null or _category = '' then
    raise exception 'Product category is required';
  end if;

  -- ✅ Generate slug (name + category)
  _slug := lower(regexp_replace(_name || '-' || _category, '[^a-zA-Z0-9]+', '-', 'g'));

  -- ✅ Check uniqueness for same seller (slug)
  if exists (
    select 1
    from public.product
    where seller_id = _seller_id
      and slug = _slug
      and deleted_at is null
  ) then
    raise exception 'You already have a product with this name in the same category';
  end if;

  -- ✅ Insert product
  insert into public.product (
    seller_id,
    name,
    slug,
    description,
    compatibility,
    category,
    thumbnail
  )
  values (
    _seller_id,
    _name,
    _slug,
    payload->>'description',
    payload->>'compatibility',
    _category,
    _thumbnail
  )
  returning id into _product_id;

  -- ✅ Insert all variants
  for _variant in
    select jsonb_array_elements(payload->'variants')
  loop
    insert into public.product_variants (
      product_id,
      brand,
      image,
      color,
      storage,
      purchase_price,
      wholesale_price,
      price,
      mrp,
      quantity
    ) values (
      _product_id,
      _variant->>'brand',
      _variant->'image',
      _variant->'color',
      _variant->>'storage',
      (_variant->>'purchase_price')::numeric,
      (_variant->>'wholesale_price')::numeric,
      (_variant->>'price')::numeric,
      (_variant->>'mrp')::numeric,
      coalesce((_variant->>'quantity')::int, 0)
    );
  end loop;

  return _product_id;
end;
$$;


ALTER FUNCTION "public"."addproduct"("payload" "jsonb") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."balance"() RETURNS "json"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  is_seller boolean;
BEGIN
  -- Detect seller by sellerID
  SELECT EXISTS (
    SELECT 1
    FROM user_balance
    WHERE "sellerID" = auth.uid()
  )
  INTO is_seller;

  -- SELLER VIEW
  IF is_seller THEN
    RETURN (
      SELECT json_build_object(
        'get',
          COALESCE(SUM(CASE WHEN balance < 0 THEN ABS(balance) END), 0),
        'give',
          COALESCE(SUM(CASE WHEN balance > 0 THEN balance END), 0)
      )
      FROM user_balance
      WHERE "sellerID" = auth.uid()
    );

  -- USER VIEW
  ELSE
    RETURN (
      SELECT json_build_object(
        'get',
          COALESCE(SUM(CASE WHEN balance > 0 THEN balance END), 0),
        'give',
          COALESCE(SUM(CASE WHEN balance < 0 THEN ABS(balance) END), 0)
      )
      FROM user_balance
      WHERE "userPhone" = auth.jwt() ->> 'phone'
    );
  END IF;
END;
$$;


ALTER FUNCTION "public"."balance"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."can"("p_username" "text") RETURNS TABLE("permission_key" "text", "has_permission" boolean)
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  v_auth_uid uuid := auth.uid();       -- Supabase auth UUID
  v_current_user_id uuid;              -- permanent users.id
  v_target_user_id uuid;               -- permanent users.id
BEGIN
  -- If no logged-in session → deny all
  IF v_auth_uid IS NULL THEN
    RETURN QUERY
    SELECT key, FALSE
    FROM permissions;
    RETURN;
  END IF;

  -- Map auth.uid() → users.id
  SELECT id
  INTO v_current_user_id
  FROM users
  WHERE auth_id = v_auth_uid
  LIMIT 1;

  -- If auth_id not mapped → deny all
  IF v_current_user_id IS NULL THEN
    RETURN QUERY
    SELECT key, FALSE
    FROM permissions;
    RETURN;
  END IF;

  -- Get target profile by username
  SELECT id
  INTO v_target_user_id
  FROM users
  WHERE username = p_username
  LIMIT 1;

  -- If username not found → deny all
  IF v_target_user_id IS NULL THEN
    RETURN QUERY
    SELECT key, FALSE
    FROM permissions;
    RETURN;
  END IF;

  -- 🔒 Ownership check
  IF v_current_user_id != v_target_user_id THEN
    RETURN QUERY
    SELECT key, FALSE
    FROM permissions;
    RETURN;
  END IF;

  -- ✅ User is viewing their own profile → check permissions
  RETURN QUERY
  SELECT
    p.key AS permission_key,
    EXISTS (
      SELECT 1
      FROM get_user_permissions(v_current_user_id) gp
      WHERE gp.permission_key = p.key
    ) AS has_permission
  FROM permissions p;

END;
$$;


ALTER FUNCTION "public"."can"("p_username" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."can"("p_permissions" "text"[], "p_username" "text") RETURNS TABLE("permission_key" "text", "has_permission" boolean)
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  v_is_owner boolean;
BEGIN
  -- Check if the current user is the owner of the profile
  SELECT (u.username = p_username)
  INTO v_is_owner
  FROM users u
  WHERE u.id = auth.uid();

  -- If not logged in, default to false
  IF v_is_owner IS NULL THEN
    v_is_owner := false;
  END IF;

  -- Return permission results
  RETURN QUERY
  SELECT
    perm.permission_key,
    (
      -- User must be owner AND have permission
      v_is_owner
      AND EXISTS (
        SELECT 1
        FROM get_user_permissions(auth.uid()) up
        WHERE up.permission_key = perm.permission_key
      )
    ) AS has_permission
  FROM unnest(p_permissions) AS perm(permission_key);
END;
$$;


ALTER FUNCTION "public"."can"("p_permissions" "text"[], "p_username" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."checkauth"("p_permissions" "text"[]) RETURNS TABLE("permission_key" "text", "has_permission" boolean)
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
begin
    return query
    select
        perm.permission_key,
        exists (
            select 1
            from get_user_permissions(auth.uid()) up
            where up.permission_key = perm.permission_key
        ) as has_permission
    from unnest(p_permissions) as perm(permission_key);
end;
$$;


ALTER FUNCTION "public"."checkauth"("p_permissions" "text"[]) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."cleanup_empty_categories"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
begin
    delete from product_categories pc
    where pc.seller_id = OLD.seller_id
      and pc.category = OLD.category
      and not exists (
          select 1
          from product p
          where p.seller_id = OLD.seller_id
            and p.category = OLD.category
            and p.deleted_at is null
      );

    return OLD;
end;
$$;


ALTER FUNCTION "public"."cleanup_empty_categories"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."cleanup_trashed_content"() RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    -- Delete content that has been in trash for more than 7 days
    DELETE FROM public.content 
    WHERE status = 'deleted' 
    AND auto_delete_at < NOW();
    
    -- Log cleanup (optional)
    RAISE NOTICE 'Cleaned up trashed content older than 7 days';
END;
$$;


ALTER FUNCTION "public"."cleanup_trashed_content"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."brands" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "keywords" "text"[] DEFAULT '{}'::"text"[],
    "description" "text",
    "image" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."brands" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."create_brand"("p_name" "text", "p_keywords" "text"[] DEFAULT '{}'::"text"[], "p_description" "text" DEFAULT NULL::"text", "p_image" "text" DEFAULT NULL::"text") RETURNS "public"."brands"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
declare
    new_brand brands%rowtype;
begin
    -- Permission check
    if not exists (
        select 1
        from get_user_permissions(auth.uid())
        where permission_key = 'create:brand'
    ) then
        raise exception 'Permission denied';
    end if;

    -- Unique name check
    if exists (
        select 1 from brands where name = p_name
    ) then
        raise exception 'Brand with this name already exists';
    end if;

    -- Insert brand
    insert into brands (name, keywords, description, image)
    values (p_name, p_keywords, p_description, p_image)
    returning * into new_brand;

    return new_brand;
end;
$$;


ALTER FUNCTION "public"."create_brand"("p_name" "text", "p_keywords" "text"[], "p_description" "text", "p_image" "text") OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."categories" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "keywords" "text"[] DEFAULT '{}'::"text"[],
    "description" "text",
    "image" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."categories" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."create_category"("p_name" "text", "p_keywords" "text"[] DEFAULT '{}'::"text"[], "p_description" "text" DEFAULT ''::"text", "p_image" "text" DEFAULT NULL::"text") RETURNS "public"."categories"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
declare
    new_cat categories%rowtype;
begin
    -- Permission check
    if not exists (
        select 1
        from get_user_permissions(auth.uid())
        where permission_key = 'create:category'
    ) then
        raise exception 'Permission denied';
    end if;

    -- Check if category name already exists
    if exists (select 1 from categories where name = p_name) then
        raise exception 'Category with this name already exists';
    end if;

    -- Insert new category
    insert into categories (name, keywords, description, image)
    values (p_name, p_keywords, p_description, p_image)
    returning * into new_cat;

    return new_cat;
end;
$$;


ALTER FUNCTION "public"."create_category"("p_name" "text", "p_keywords" "text"[], "p_description" "text", "p_image" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."create_order_with_products"("_user_name" "text", "_user_phone" "text", "_user_address" "jsonb", "_seller_id" "uuid", "_seller_name" "text", "_seller_username" "text", "_seller_phone" "text", "_seller_gstin" "text", "_seller_address" "jsonb", "_paid" numeric, "_total_amount" numeric, "_items" "jsonb") RETURNS "text"
    LANGUAGE "plpgsql"
    AS $$
declare
  new_order_id text;
  item jsonb;
begin
  -- Create order
  insert into orders (
    "userName", "userPhone", "userAddress",
    "sellerID", "sellerName", "sellerUserName",
    "sellerPhone", "sellerGSTIN", "sellerAddress",
    paid, "totalAmount"
  )
  values (
    _user_name, _user_phone, _user_address,
    _seller_id, _seller_name, _seller_username,
    _seller_phone, _seller_gstin, _seller_address,
    _paid, _total_amount
  )
  returning id into new_order_id;

  for item in select * from jsonb_array_elements(_items)
  loop
    insert into order_products (
      order_id, product_id, name, category,
      brand, color, storage, serial,
      price, purchase_price, quantity
    )
    values (
      new_order_id,
      (item->>'product_id')::uuid,
      item->>'name',
      item->>'category',
      item->>'brand',
      (item->'color'),
      item->>'storage',
      (item->'serial'),
      (item->>'price')::numeric,
      (item->>'purchase_price')::numeric,
      (item->>'quantity')::int
    );
  end loop;

  return new_order_id;

exception
  when others then
    raise exception 'Order creation failed: %', sqlerrm;
end;
$$;


ALTER FUNCTION "public"."create_order_with_products"("_user_name" "text", "_user_phone" "text", "_user_address" "jsonb", "_seller_id" "uuid", "_seller_name" "text", "_seller_username" "text", "_seller_phone" "text", "_seller_gstin" "text", "_seller_address" "jsonb", "_paid" numeric, "_total_amount" numeric, "_items" "jsonb") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."create_transaction_after_order_insert"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    -- 1. Debit transaction for totalAmount
    INSERT INTO public.transactions(
        "userPhone",
        "sellerID",
        "orderID",
        amount,
        type,
        mode,
        note,
        origin_type,
        origin_id
    ) VALUES (
        NEW."userPhone",
        NEW."sellerID",
        NEW.id,
        NEW."totalAmount",
        'debit',
        NEW.mode,
        NEW.note,
        'order_total',
        NEW.id
    );

    -- 2. Credit transaction for paid amount if exists
    IF NEW.paid IS NOT NULL AND NEW.paid > 0 THEN
        INSERT INTO public.transactions(
            "userPhone",
            "sellerID",
            "orderID",
            amount,
            type,
            mode,
            note,
            origin_type,
            origin_id
        ) VALUES (
            NEW."userPhone",
            NEW."sellerID",
            NEW.id,
            NEW.paid,
            'credit',
            NEW.mode,
            NEW.note,
            'order_paid',
            NEW.id
        );
    END IF;

    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."create_transaction_after_order_insert"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."create_transaction_on_full_refund"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    IF NEW.is_refunded = TRUE AND (OLD.is_refunded IS DISTINCT FROM NEW.is_refunded) THEN
        INSERT INTO transactions(
            "userPhone", "sellerID", "orderID", amount, type, mode, note, origin_type, origin_id
        ) VALUES (
            NEW."userPhone",
            NEW."sellerID",
            NEW.id,
            NEW."totalAmount",
            'credit',
            NEW.mode,
            NEW.note,
            'order_full_refund',
            NEW.id
        );
    END IF;

    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."create_transaction_on_full_refund"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."create_transaction_on_paid_update"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    delta_paid numeric;
BEGIN
    delta_paid := NEW.paid - COALESCE(OLD.paid,0);

    IF delta_paid > 0 THEN
        INSERT INTO transactions(
            userPhone, sellerID, orderID, amount, type, mode, note, origin_type, origin_id
        )
        VALUES (
            NEW.userPhone,
            NEW.sellerID,
            NEW.id,
            delta_paid,
            'credit',
            NEW.mode,
            NEW.note,
            'order_paid',
            NEW.id
        );
    END IF;

    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."create_transaction_on_paid_update"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."create_transaction_on_product_return"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    v_return_amount numeric;
BEGIN
    -- Amount for the returned products only
    v_return_amount := (NEW.returned_quantity - OLD.returned_quantity) * NEW.price;

    IF v_return_amount > 0 THEN
        INSERT INTO transactions(
            "userPhone", "sellerID", "orderID", amount, type, mode, note, origin_type, origin_id, origin_qty
        ) VALUES (
            (SELECT "userPhone" FROM orders WHERE id = NEW.order_id),
            NEW."sellerID",
            NEW.order_id,
            v_return_amount,
            'credit',  -- refund goes to user
            NULL,
            NULL,
            'product_return',
            NEW.id::text,
            (NEW.returned_quantity - OLD.returned_quantity)
        );
    END IF;

    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."create_transaction_on_product_return"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."create_transaction_on_refund"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    v_refund_amount numeric(10, 2) := 0;
BEGIN
    -- Only act if refund flag changes to TRUE
    IF (NEW.is_refunded IS TRUE AND OLD.is_refunded IS DISTINCT FROM TRUE) THEN
        v_refund_amount := NEW."totalAmount";
    ELSE
        -- If not a full refund, check if any order_products were returned
        SELECT COALESCE(SUM(price * returned_quantity), 0)
        INTO v_refund_amount
        FROM public.order_products
        WHERE order_id = NEW.id
        AND returned_quantity > 0;
    END IF;

    -- If there’s something to refund, insert a credit transaction
    IF v_refund_amount > 0 THEN
        INSERT INTO public.transactions (
            "userPhone",
            "sellerID",
            "orderID",
            amount,
            type,
            mode,
            note
        )
        VALUES (
            NEW."userPhone",
            NEW."sellerID",
            NEW.id,
            v_refund_amount,
            'credit',
            NEW.mode,
            COALESCE(NEW.refund_reason, 'Refund processed')
        );
    END IF;

    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."create_transaction_on_refund"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."delete_brand"("p_id" "uuid") RETURNS "public"."brands"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
declare
    deleted_brand brands%rowtype;
begin
    -- Permission check
    if not exists (
        select 1
        from get_user_permissions(auth.uid())
        where permission_key = 'delete:brand'
    ) then
        raise exception 'Permission denied';
    end if;

    delete from brands
    where id = p_id
    returning * into deleted_brand;

    return deleted_brand;
end;
$$;


ALTER FUNCTION "public"."delete_brand"("p_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."delete_category"("p_id" "uuid") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
declare
    cat_record categories%rowtype;
begin
    -- Check permissions
    if not exists (
        select 1
        from user_permissions up
        join permissions p on up.permission_id = p.id
        where up.user_id = auth.uid()
          and p.key = 'delete:category'
          and up.is_granted
    ) then
        raise exception 'Permission denied';
    end if;

    -- Fetch category
    select * into cat_record from categories where id = p_id;

    if cat_record is null then
        raise exception 'Category not found';
    end if;

    -- Delete category
    delete from categories where id = p_id;

    -- File deletion handled in server action
end;
$$;


ALTER FUNCTION "public"."delete_category"("p_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."ensure_product_category_exists"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
begin
    if NEW.category is not null then
        insert into product_categories (seller_id, category)
        values (NEW.seller_id, NEW.category)
        on conflict do nothing;
    end if;
    return NEW;
end;
$$;


ALTER FUNCTION "public"."ensure_product_category_exists"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."fn_create_transaction_after_order_insert"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
  base_ts timestamptz := clock_timestamp();
BEGIN
  INSERT INTO public.transactions (
    user_id,
    "orderID",
    "sellerID",
    "userPhone",
    amount,
    type,
    mode,
    note,
    origin_type,
    origin_id,
    "createdAt",
    updated_at
  )
  VALUES (
    NEW.user_id,
    NEW.id,
    NEW."sellerID",
    NEW."userPhone",
    NEW."totalAmount",
    'debit',
    NEW.mode,
    'Order Created',
    'order_debit',
    NEW.id::text,
    base_ts,
    base_ts
  );

  IF NEW.paid IS NOT NULL AND NEW.paid > 0 THEN
    INSERT INTO public.transactions (
      user_id,
      "orderID",
      "sellerID",
      "userPhone",
      amount,
      type,
      mode,
      note,
      origin_type,
      origin_id,
      "createdAt",
      updated_at
    )
    VALUES (
      NEW.user_id,
      NEW.id,
      NEW."sellerID",
      NEW."userPhone",
      NEW.paid,
      'credit',
      NEW.mode,
      'Order Payment',
      'order_credit',
      NEW.id::text,
      base_ts + interval '1 millisecond',
      base_ts + interval '1 millisecond'
    );
  END IF;

  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."fn_create_transaction_after_order_insert"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."fn_create_transaction_on_full_refund"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
begin
  if new.is_refunded is distinct from old.is_refunded and new.is_refunded = true then
    insert into transactions (
      "orderID", "sellerID", "userPhone", "amount", "type", "createdAt", "note"
    )
    values (
      new.id,
      new."sellerID",
      new."userPhone",
      new.totalAmount,
      'credit',
      now(),
      'Order Refund'
    );
  end if;

  return new;
end;
$$;


ALTER FUNCTION "public"."fn_create_transaction_on_full_refund"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."fn_create_transaction_on_paid_update"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
begin
  if new.paid is distinct from old.paid and new.paid > old.paid then
    insert into transactions (
      "orderID", "sellerID", "userPhone", "amount", "type", "createdAt", "note"
    )
    values (
      new.id,
      new."sellerID",
      new."userPhone",
      new.paid - coalesce(old.paid,0),
      'credit',
      now(),
      'Order Payment Updated'
    );
  end if;

  return new;
end;
$$;


ALTER FUNCTION "public"."fn_create_transaction_on_paid_update"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."fn_create_transaction_on_product_return"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    return_amount numeric;
    return_qty integer;
BEGIN
    return_qty := NEW.returned_quantity - OLD.returned_quantity;
    IF return_qty > 0 THEN
        return_amount := return_qty * NEW.price;

        INSERT INTO public.transactions(
            "userPhone", "sellerID", "orderID", amount, type, note, origin_type, origin_id, origin_qty
        )
        VALUES(
            (SELECT "userPhone" FROM public.orders WHERE id = NEW.order_id),
            (SELECT "sellerID" FROM public.orders WHERE id = NEW.order_id),
            NEW.order_id,
            return_amount,
            'credit',
            'Product returned',
            'product_return',
            NEW.id::text,
            return_qty
        );
    END IF;

    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."fn_create_transaction_on_product_return"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."fn_handle_product_return_safe"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    quantity_to_restock int;
BEGIN
    -- Safety check: never return more than sold quantity
    IF NEW.returned_quantity > NEW.quantity THEN
        RAISE EXCEPTION 'Returned quantity (%) cannot exceed sold quantity (%)', NEW.returned_quantity, NEW.quantity;
    END IF;

    -- Only restock if returned_quantity increased
    IF NEW.returned_quantity > OLD.returned_quantity THEN
        quantity_to_restock := NEW.returned_quantity - OLD.returned_quantity;

        -- Atomically increase product_variant quantity
        UPDATE product_variants
        SET quantity = quantity + quantity_to_restock,
            updated_at = now()
        WHERE id = NEW.product_id;

        -- Mark fully returned if all quantity is returned
        IF NEW.returned_quantity = NEW.quantity THEN
            NEW.is_fully_returned := true;
        END IF;
    END IF;

    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."fn_handle_product_return_safe"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."fn_reduce_product_variant_quantity"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    UPDATE product_variants
    SET quantity = quantity - NEW.quantity,
        updated_at = NOW()
    WHERE id = NEW.product_id;

    RETURN NULL;
END;
$$;


ALTER FUNCTION "public"."fn_reduce_product_variant_quantity"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."fn_reduce_variant_qty_after_insert"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    UPDATE public.product_variants
    SET quantity = quantity - NEW.quantity
    WHERE id = NEW.product_id;

    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."fn_reduce_variant_qty_after_insert"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."fn_update_product_variants_jsonb"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    -- You can keep your existing logic here for JSONB update
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."fn_update_product_variants_jsonb"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."generate_content_slug"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    base_slug TEXT;
    final_slug TEXT;
    counter INTEGER := 0;
BEGIN
    -- Only generate slug if not provided and title exists
    IF NEW.slug IS NULL AND NEW.title IS NOT NULL THEN
        -- Generate base slug from title
        base_slug := lower(trim(regexp_replace(NEW.title, '[^a-zA-Z0-9\s]', '', 'g')));
        base_slug := regexp_replace(base_slug, '\s+', '-', 'g');
        base_slug := trim(base_slug, '-');
        
        -- Ensure slug is not empty
        IF base_slug = '' THEN
            base_slug := 'content';
        END IF;
        
        final_slug := base_slug;
        
        -- Check for uniqueness and append counter if needed
        WHILE EXISTS(SELECT 1 FROM public.user_content WHERE user_id = NEW.user_id AND slug = final_slug AND id != COALESCE(NEW.id, gen_random_uuid())) LOOP
            counter := counter + 1;
            final_slug := base_slug || '-' || counter;
        END LOOP;
        
        NEW.slug := final_slug;
    END IF;
    
    -- Auto-set published_at for published content
    IF NEW.status = 'published' AND NEW.published_at IS NULL THEN
        NEW.published_at := NOW();
    END IF;
    
    -- Update updated_at timestamp
    NEW.updated_at := NOW();
    
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."generate_content_slug"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_brands"() RETURNS SETOF "public"."brands"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
begin
    -- No permission check needed since RLS handles select
    return query select * from brands order by name;
end;
$$;


ALTER FUNCTION "public"."get_brands"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_categories"() RETURNS SETOF "public"."categories"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
begin
    -- No permission check needed since RLS handles select
    return query select * from categories order by name;
end;
$$;


ALTER FUNCTION "public"."get_categories"() OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."users" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "phone" "text" NOT NULL,
    "name" "text",
    "username" "text",
    "gender" "text",
    "dob" "date",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "active" boolean DEFAULT true,
    "role" bigint DEFAULT 1 NOT NULL,
    "avatar" "text",
    "bio" "text",
    "cover" "text",
    "verified" boolean DEFAULT false,
    "last_login_at" timestamp with time zone,
    "last_login_ip" "inet",
    "last_login_device" "text",
    "address" "jsonb",
    "showWhatsapp" boolean DEFAULT false NOT NULL,
    "auth_id" "uuid"
);


ALTER TABLE "public"."users" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_current_user_details"() RETURNS "public"."users"
    LANGUAGE "sql" SECURITY DEFINER
    AS $$
  select *
  from users
  where id = auth.uid()
  limit 1;
$$;


ALTER FUNCTION "public"."get_current_user_details"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_order_details"("p_order_id" "text") RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
declare
  v_order jsonb;
begin
  select to_jsonb(o) || jsonb_build_object(
    'products', (
      select coalesce(jsonb_agg(to_jsonb(op)), '[]'::jsonb)
      from order_products op
      where op.order_id = o.id
    )
  )
  into v_order
  from orders o
  where o.id = p_order_id;

  return v_order;
end;
$$;


ALTER FUNCTION "public"."get_order_details"("p_order_id" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_role_with_permissions"("role_id" bigint) RETURNS "jsonb"
    LANGUAGE "sql" SECURITY DEFINER
    AS $$
  select jsonb_build_object(
    'id', r.id,
    'role', r.role,
    'permissions',
    (select jsonb_agg(p.key)
     from public.role_permissions rp
     join public.permissions p on p.id = rp.permission_id
     where rp.role_id = r.id)
  )
  from public.roles r
  where r.id = role_id;
$$;


ALTER FUNCTION "public"."get_role_with_permissions"("role_id" bigint) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_seller_balance"("p_seller_id" "uuid", "p_user_phone" "text") RETURNS TABLE("total_credit" numeric, "total_debit" numeric, "balance" numeric, "message" "text")
    LANGUAGE "plpgsql"
    AS $$
begin
    return query
    select 
        total_credit,
        total_debit,
        balance,
        case 
            when balance > 0 then 'You will get ' || balance
            when balance < 0 then 'You will give ' || abs(balance)
            else 'Settled up'
        end as message
    from public.seller_balance
    where "sellerID" = p_seller_id
      and "userPhone" = p_user_phone;
end;
$$;


ALTER FUNCTION "public"."get_seller_balance"("p_seller_id" "uuid", "p_user_phone" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_user_balance"("p_seller_id" "uuid", "p_user_phone" "text") RETURNS TABLE("total_credit" numeric, "total_debit" numeric, "balance" numeric, "user_message" "text", "seller_message" "text")
    LANGUAGE "plpgsql"
    AS $$
begin
    return query
    select 
        total_credit,
        total_debit,
        balance,
        -- User perspective
        case 
            when balance > 0 then 'You will get ' || balance
            when balance < 0 then 'You will give ' || abs(balance)
            else 'Settled up'
        end as user_message,
        -- Seller perspective
        case 
            when balance > 0 then 'You will give ' || balance
            when balance < 0 then 'You will get ' || abs(balance)
            else 'Settled up'
        end as seller_message
    from public.user_balance
    where "sellerID" = p_seller_id
      and "userPhone" = p_user_phone;
end;
$$;


ALTER FUNCTION "public"."get_user_balance"("p_seller_id" "uuid", "p_user_phone" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_user_balance"("p_seller_id" "uuid", "p_user_phone" "text", "p_is_seller" boolean) RETURNS TABLE("total_credit" numeric, "total_debit" numeric, "balance" numeric, "message" "text")
    LANGUAGE "plpgsql"
    AS $$
begin
    return query
    select 
        total_credit,
        total_debit,
        balance,
        case 
            when p_is_seller then
                case 
                    when balance > 0 then 'You will give ' || balance
                    when balance < 0 then 'You will get ' || abs(balance)
                    else 'Settled up'
                end
            else
                case 
                    when balance > 0 then 'You will get ' || balance
                    when balance < 0 then 'You will give ' || abs(balance)
                    else 'Settled up'
                end
        end as message
    from public.user_balance
    where "sellerID" = p_seller_id
      and "userPhone" = p_user_phone;
end;
$$;


ALTER FUNCTION "public"."get_user_balance"("p_seller_id" "uuid", "p_user_phone" "text", "p_is_seller" boolean) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_user_permissions"("user_id" "uuid") RETURNS TABLE("role_id" bigint, "role_name" "text", "permission_key" "text")
    LANGUAGE "sql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  WITH user_info AS (
    SELECT u.id, u.role, r.role AS role_name
    FROM public.users u
    JOIN public.roles r ON r.id = u.role
    WHERE u.auth_id = user_id   -- 🔥 change is here
  ),
  role_perms AS (
    SELECT
      ui.role AS role_id,
      ui.role_name,
      p.id AS permission_id,
      p.key AS permission_key
    FROM user_info ui
    JOIN public.role_permissions rp ON rp.role_id = ui.role
    JOIN public.permissions p ON p.id = rp.permission_id
  ),
  user_overrides AS (
    SELECT
      up.permission_id,
      p.key AS permission_key,
      up.is_granted
    FROM public.user_permissions up
    JOIN public.permissions p ON p.id = up.permission_id
    JOIN user_info ui ON ui.id = up.user_id
  )
  SELECT
    rp.role_id,
    rp.role_name,
    rp.permission_key
  FROM role_perms rp
  WHERE NOT EXISTS (
    SELECT 1
    FROM user_overrides uo
    WHERE uo.permission_id = rp.permission_id
      AND uo.is_granted = FALSE
  )
  UNION ALL
  SELECT
    (SELECT role FROM user_info),
    (SELECT role_name FROM user_info),
    uo.permission_key
  FROM user_overrides uo
  WHERE uo.is_granted = TRUE;
$$;


ALTER FUNCTION "public"."get_user_permissions"("user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_user_transactions"("p_seller_id" "uuid", "p_user_phone" "text") RETURNS "jsonb"
    LANGUAGE "plpgsql"
    AS $$
declare
  result jsonb;
begin
  select jsonb_build_object(
    'empty', count(t.*) = 0,
    'transactions', coalesce(
      jsonb_agg(
        jsonb_build_object(
          'id', t.id,
          'userPhone', t."userPhone",
          'sellerID', t."sellerID",
          'orderID', t."orderID",
          'amount', t.amount,
          'type', t.type,
          'mode', t.mode,
          'note', t.note,
          'notes', t.notes,
          'createdAt', t."createdAt",
          'updatedAt', t.updated_at,
          'order', (
            select jsonb_build_object(
              'id', o.id,
              'totalAmount', o."totalAmount",
              'paid', o.paid,
              'mode', o.mode,
              'note', o.note,
              'is_refunded', o.is_refunded,
              'refund_reason', o.refund_reason,
              'createdAt', o."createdAt",
              'products', coalesce(
                jsonb_agg(
                  jsonb_build_object(
                    'id', op.id,
                    'name', op.name,
                    'category', op.category,                -- ✅ added category
                    'brand', op.brand,                      -- ✅ also included brand for context
                    'color', op.color,                      -- ✅ and color (since it's jsonb)
                    'storage', op.storage,
                    'serial', op.serial,
                    'price', op.price,
                    'purchase_price', op.purchase_price,
                    'quantity', op.quantity,
                    'returned_quantity', op.returned_quantity,
                    'is_fully_returned', op.is_fully_returned
                  )
                  order by op.id asc
                ) filter (where op.id is not null), '[]'::jsonb
              )
            )
            from orders o
            left join order_products op on op.order_id = o.id
            where o.id = t."orderID"
            group by o.id
          )
        )
        order by t."createdAt" desc
      ), '[]'::jsonb
    ),
    'balance', (
      select jsonb_build_object(
        'total_credit', coalesce(sum(t.amount) filter (where t.type = 'credit'), 0),
        'total_debit', coalesce(sum(t.amount) filter (where t.type = 'debit'), 0),
        'balance', coalesce(sum(t.amount) filter (where t.type = 'credit'), 0) -
                   coalesce(sum(t.amount) filter (where t.type = 'debit'), 0)
      )
      from transactions t
      where t."sellerID" = p_seller_id
        and t."userPhone" = p_user_phone
    )
  )
  into result
  from (
    select *
    from transactions
    where "sellerID" = p_seller_id
      and "userPhone" = p_user_phone
    order by "createdAt" desc
    limit 40
  ) t;

  return result;
end;
$$;


ALTER FUNCTION "public"."get_user_transactions"("p_seller_id" "uuid", "p_user_phone" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_order_refund"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    v_order RECORD;
    v_seller_id uuid;
    v_user_phone text;
    v_refund_amount numeric(10,2);
    v_total_refund numeric(10,2);
BEGIN
    -- Case 1: Partial product return (product-level)
    IF TG_TABLE_NAME = 'order_products' AND NEW.returned_quantity > OLD.returned_quantity THEN
        v_refund_amount := (NEW.returned_quantity - OLD.returned_quantity) * NEW.price;

        -- Restock only returned quantity
        UPDATE public.product_variants
        SET quantity = quantity + (NEW.returned_quantity - OLD.returned_quantity)
        WHERE id = NEW.product_id;

        -- Get order context
        SELECT "sellerID", "userPhone"
        INTO v_seller_id, v_user_phone
        FROM public.orders
        WHERE id = NEW.order_id;

        -- Add transaction for refund
        INSERT INTO public.transactions (
            "userPhone", "sellerID", "orderID",
            amount, type, mode, note
        ) VALUES (
            v_user_phone, v_seller_id, NEW.order_id,
            v_refund_amount, 'credit', NULL,
            CONCAT('Partial refund for ', NEW.name, ' in order ', NEW.order_id)
        );

        -- Mark product as fully returned if all quantities refunded
        IF NEW.returned_quantity = NEW.quantity THEN
            UPDATE public.order_products
            SET is_fully_returned = TRUE
            WHERE id = NEW.id;
        END IF;

        RETURN NEW;
    END IF;


    -- Case 2: Full order refund (order-level)
    IF TG_TABLE_NAME = 'orders' AND NEW.is_refunded IS TRUE AND OLD.is_refunded IS DISTINCT FROM TRUE THEN
        -- Lock all order products to ensure atomicity
        PERFORM 1 FROM public.order_products WHERE order_id = NEW.id FOR UPDATE;

        -- Restock all products
        UPDATE public.product_variants AS pv
        SET quantity = pv.quantity + op.quantity
        FROM public.order_products AS op
        WHERE op.product_id = pv.id AND op.order_id = NEW.id;

        -- Add a credit transaction for the full refund
        INSERT INTO public.transactions (
            "userPhone", "sellerID", "orderID",
            amount, type, mode, note
        )
        VALUES (
            NEW."userPhone", NEW."sellerID", NEW.id,
            NEW."totalAmount", 'credit', NULL,
            CONCAT('Full refund for order ', NEW.id)
        );

        -- Mark refund timestamp
        UPDATE public.orders
        SET refunded_at = NOW()
        WHERE id = NEW.id;

        RETURN NEW;
    END IF;

    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."handle_order_refund"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."insert_category"("_name" "text", "_keywords" "text"[], "_description" "text", "_image" "text") RETURNS SETOF "public"."categories"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
begin
    return query
    insert into categories (name, keywords, description, image)
    values (_name, _keywords, _description, _image)
    returning *;
end;
$$;


ALTER FUNCTION "public"."insert_category"("_name" "text", "_keywords" "text"[], "_description" "text", "_image" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_username_available"("username_input" "text") RETURNS boolean
    LANGUAGE "plpgsql"
    AS $$
declare
    exists boolean;
begin
    select exists (
        select 1 from public.users
        where lower(trim(username)) = lower(trim(username_input))
    ) into exists;
    return not exists;
end;
$$;


ALTER FUNCTION "public"."is_username_available"("username_input" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."my_transaction"() RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
declare
    v_seller_id uuid := auth.uid();
    v_user_phone text := auth.jwt() ->> 'phone';
    v_result jsonb;
begin

    -- =========================
    -- SELLER VIEW
    -- =========================
    if v_seller_id is not null then

        select jsonb_agg(row_to_json(t))
        into v_result
        from (
            select
                coalesce(u.name, c.name) as name,
                u.avatar as avatar,
                ub."userPhone" as phone,
                ub.balance as balance,
                ub.updated_at
            from user_balance ub
            left join users u
                   on u.phone = ub."userPhone"
            left join customers c
                   on c.phone = ub."userPhone"
            where ub."sellerID" = v_seller_id
            order by ub.updated_at desc
            limit 20
        ) t;

        return coalesce(v_result, '[]'::jsonb);
    end if;

    -- =========================
    -- USER VIEW
    -- =========================
    if v_user_phone is not null then

        select jsonb_agg(row_to_json(t))
        into v_result
        from (
            select
                u.name as name,
                u.avatar as avatar,
                u.phone as phone,
                ub.balance as balance,
                ub.updated_at
            from user_balance ub
            join users u
                 on u.id = ub."sellerID"
            where ub."userPhone" = v_user_phone
            order by ub.updated_at desc
            limit 20
        ) t;

        return coalesce(v_result, '[]'::jsonb);
    end if;

    raise exception 'Unauthorized';
end;
$$;


ALTER FUNCTION "public"."my_transaction"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."my_transaction"("query" "text" DEFAULT NULL::"text", "page" integer DEFAULT 1, "page_limit" integer DEFAULT 40) RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$

DECLARE
    auth_user uuid := auth.uid();
    uid uuid;
    caller_role int;
    caller_phone text;

    q text;
    offset_val int;

    result jsonb;
    total_count bigint;

    view_mode text;

BEGIN


IF auth_user IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
END IF;

SELECT id, role, phone
INTO uid, caller_role, caller_phone
FROM users
WHERE auth_id = auth_user
AND active = true;

IF uid IS NULL THEN
    RAISE EXCEPTION 'Invalid user';
END IF;


q := nullif(trim(query), '');
page := greatest(page,1);
page_limit := least(greatest(page_limit,1),40);
offset_val := (page - 1) * page_limit;


IF caller_role = 1 THEN

    view_mode := 'user';

    WITH base AS (

        SELECT
            ub."sellerID" AS id,
            s.name,
            s.avatar,
            s.phone,
            ub.balance,
            ub.updated_at

        FROM user_balance ub
        JOIN users s
        ON s.id = ub."sellerID"

        WHERE ub.user_id = uid

    ),

    searched AS (

        SELECT *
        FROM base
        WHERE
            q IS NULL
            OR name ILIKE '%' || q || '%'
            OR phone ILIKE '%' || q || '%'

    ),

    paged AS (

        SELECT *
        FROM searched
        ORDER BY updated_at DESC
        LIMIT page_limit
        OFFSET offset_val

    )

    SELECT
        jsonb_agg(row_to_json(paged)),
        (SELECT count(*) FROM searched)
    INTO result, total_count
    FROM paged;


ELSIF caller_role IN (2,3) THEN

    view_mode := 'seller';

    WITH base AS (

        SELECT
            ub.user_id AS id,

            COALESCE(u.name, c.name) AS name,
            u.avatar,
            ub."userPhone" AS phone,

            ub.balance,
            ub.updated_at

        FROM user_balance ub

        LEFT JOIN users u
        ON u.id = ub.user_id

        LEFT JOIN customers c
        ON c.phone = ub."userPhone"

        WHERE ub."sellerID" = uid

    ),

    searched AS (

        SELECT *
        FROM base
        WHERE
            q IS NULL
            OR name ILIKE '%' || q || '%'
            OR phone ILIKE '%' || q || '%'

    ),

    paged AS (

        SELECT *
        FROM searched
        ORDER BY updated_at DESC
        LIMIT page_limit
        OFFSET offset_val

    )

    SELECT
        jsonb_agg(row_to_json(paged)),
        (SELECT count(*) FROM searched)
    INTO result, total_count
    FROM paged;

ELSE
    RAISE EXCEPTION 'Unauthorized role';
END IF;


RETURN jsonb_build_object(
    'view', view_mode,
    'transaction', COALESCE(result, '[]'::jsonb),
    'total', total_count,
    'page', page,
    'limit', page_limit,
    'hasMore', (page * page_limit) < total_count,
    'empty', (result IS NULL OR jsonb_array_length(result) = 0)
);

END;

$$;


ALTER FUNCTION "public"."my_transaction"("query" "text", "page" integer, "page_limit" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."my_transactions"("u_id" "uuid", "page" integer DEFAULT 1, "page_limit" integer DEFAULT 40) RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$

DECLARE
    auth_user uuid := auth.uid();
    caller_id uuid;
    caller_role int;
    seller_mode boolean;

    offset_val int;
    result jsonb;

    summary_credit numeric := 0;
    summary_debit numeric := 0;
    summary_balance numeric := 0;

    total_count int := 0;
    has_more boolean := false;

BEGIN


IF auth_user IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
END IF;

SELECT id, role
INTO caller_id, caller_role
FROM users
WHERE auth_id = auth_user
AND active = true;

IF caller_id IS NULL THEN
    RAISE EXCEPTION 'Invalid user';
END IF;

seller_mode := caller_role IN (2,3);


page := GREATEST(page,1);
page_limit := LEAST(GREATEST(page_limit,1),40);
offset_val := (page - 1) * page_limit;


SELECT COUNT(*)
INTO total_count
FROM transactions
WHERE
(
    NOT seller_mode
    AND user_id = caller_id
    AND "sellerID" = u_id
)
OR
(
    seller_mode
    AND "sellerID" = caller_id
    AND user_id = u_id
);

has_more := (offset_val + page_limit) < total_count;


IF seller_mode = false THEN

    SELECT
        COALESCE(total_credit,0),
        COALESCE(total_debit,0),
        COALESCE(balance,0)
    INTO summary_credit, summary_debit, summary_balance
    FROM user_balance
    WHERE user_id = caller_id
    AND "sellerID" = u_id;

ELSE

    SELECT
        COALESCE(total_credit,0),
        COALESCE(total_debit,0),
        COALESCE(balance,0)
    INTO summary_credit, summary_debit, summary_balance
    FROM user_balance
    WHERE "sellerID" = caller_id
    AND user_id = u_id;

END IF;


SELECT jsonb_build_object(

    'page', page,
    'limit', page_limit,
    'total', total_count,
    'hasMore', has_more,
    'seller', seller_mode,

    'summary', jsonb_build_object(
        'totalReceived', CASE WHEN seller_mode THEN summary_credit ELSE summary_debit END,
        'totalPaid', CASE WHEN seller_mode THEN summary_debit ELSE summary_credit END,
        'balance', CASE WHEN seller_mode THEN summary_balance ELSE -summary_balance END
    ),

    'transactions',

    COALESCE(

        jsonb_agg(

            jsonb_build_object(

                'id', t.id,
                'sellerID', t."sellerID",
                'userID', t.user_id,
                'orderID', t."orderID",
                'amount', t.amount,
                'type', t.type,
                'mode', t.mode,
                'note', t.note,
                'notes', t.notes,
                'createdAt', t."createdAt",
                'updatedAt', t.updated_at,

                'order',

                (
                    SELECT jsonb_build_object(
                        'id', o.id,
                        'totalAmount', o."totalAmount",
                        'paid', o.paid,
                        'mode', o.mode,
                        'note', o.note,
                        'is_refunded', o.is_refunded,
                        'refund_reason', o.refund_reason,
                        'createdAt', o."createdAt",

                        'products',

                        COALESCE(
                            (
                                SELECT jsonb_agg(
                                    jsonb_build_object(
                                        'id', op.id,
                                        'name', op.name,
                                        'category', op.category,
                                        'brand', op.brand,
                                        'color', op.color,
                                        'storage', op.storage,
                                        'serial', op.serial,
                                        'price', op.price,
                                        'purchase_price', op.purchase_price,
                                        'quantity', op.quantity,
                                        'returned_quantity', op.returned_quantity,
                                        'is_fully_returned', op.is_fully_returned
                                    )
                                    ORDER BY op.id
                                )
                                FROM order_products op
                                WHERE op.order_id = o.id
                            ),
                            '[]'::jsonb
                        )
                    )
                    FROM orders o
                    WHERE o.id = t."orderID"
                )

            )

        ),

        '[]'::jsonb

    )

)

INTO result

FROM (

    SELECT *
    FROM transactions
    WHERE
        (
            NOT seller_mode
            AND user_id = caller_id
            AND "sellerID" = u_id
        )
        OR
        (
            seller_mode
            AND "sellerID" = caller_id
            AND user_id = u_id
        )

    ORDER BY "createdAt" DESC
    LIMIT page_limit
    OFFSET offset_val

) t;

RETURN result;

END;

$$;


ALTER FUNCTION "public"."my_transactions"("u_id" "uuid", "page" integer, "page_limit" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."myorders"("query" "text" DEFAULT NULL::"text", "page" integer DEFAULT 1, "page_limit" integer DEFAULT 20) RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
    auth_uid uuid := auth.uid();
    business_id uuid;
    caller_role bigint;
    q text;
    offset_val integer;
    total_count bigint;
    result jsonb;
BEGIN
    IF auth_uid IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;

    SELECT id, role
    INTO business_id, caller_role
    FROM users
    WHERE auth_id = auth_uid
      AND active = true;

    IF business_id IS NULL THEN
        RAISE EXCEPTION 'Invalid user';
    END IF;

    q := NULLIF(TRIM(query), '');
    page := GREATEST(page, 1);
    page_limit := LEAST(GREATEST(page_limit, 1), 100);
    offset_val := (page - 1) * page_limit;

    ------------------------------------------------
    -- COUNT QUERY
    ------------------------------------------------
    SELECT COUNT(*)
    INTO total_count
    FROM orders o
    WHERE
        (
            (caller_role = 1 AND o.user_id = business_id)
            OR
            (caller_role = 2 AND o."sellerID" = business_id)
            OR
            (caller_role = 3)
        )
        AND (
            q IS NULL
            OR o.id ILIKE '%' || q || '%'
            OR RIGHT(o.id, 4) = q
            OR o."userName" ILIKE '%' || q || '%'
            OR o."sellerName" ILIKE '%' || q || '%'
        );

    ------------------------------------------------
    -- PAGINATED QUERY
    ------------------------------------------------
SELECT jsonb_agg(
    jsonb_build_object(
        'id', o.id,
        'mode', o.mode,
        'note', o.note,
        'paid', o.paid,
        'totalAmount', o."totalAmount",
        'createdAt', o."createdAt",
        'updatedAt', o."updatedAt",

        'name',
            CASE
                WHEN caller_role = 1 THEN o."sellerName"
                ELSE o."userName"
            END,

        'phone',
            CASE
                WHEN caller_role = 1 THEN o."sellerPhone"
                ELSE o."userPhone"
            END,

        'username',
            CASE
                WHEN caller_role = 1 THEN o."sellerUserName"
                ELSE NULL
            END,

        'sellerID', o."sellerID",
        'sellerUserName', o."sellerUserName",

        'isSeller', (caller_role IN (2,3)),
        'canReturn', (caller_role IN (2,3)),

        'role',
            CASE
                WHEN caller_role = 1 THEN 'buyer'
                WHEN caller_role = 2 THEN 'seller'
                WHEN caller_role = 3 THEN 'admin'
            END,

        'products',
(
    SELECT jsonb_agg(
        jsonb_build_object(
            'id', op.id,
            'productID', op.product_id,

            'image',
                CASE
                    WHEN op.image IS NULL
                         OR op.image = ''
                         OR op.image = '[]'
                    THEN NULL
                    ELSE op.image
                END,

            'name', op.name,
            'category', op.category,
            'brand', op.brand,
            'color', op.color,
            'storage', op.storage,
            'serial', op.serial,
            'price', op.price,
            'quantity', op.quantity,
            'returnedQuantity', op.returned_quantity,

            'returnType',
                CASE
                    WHEN op.returned_quantity = 0 THEN 'none'
                    WHEN op.returned_quantity < op.quantity THEN 'partial'
                    ELSE 'full'
                END
        )
    )
    FROM order_products op
    WHERE op.order_id = o.id
)
    )
)
INTO result
FROM (
    SELECT *
    FROM orders o
    WHERE
        (
            (caller_role = 1 AND o.user_id = business_id)
            OR
            (caller_role = 2 AND o."sellerID" = business_id)
            OR
            (caller_role = 3)
        )
        AND (
            q IS NULL
            OR o.id ILIKE '%' || q || '%'
            OR RIGHT(o.id, 4) = q
            OR o."userName" ILIKE '%' || q || '%'
            OR o."sellerName" ILIKE '%' || q || '%'
        )
    ORDER BY o."createdAt" DESC
    LIMIT page_limit
    OFFSET offset_val
) o;
    RETURN jsonb_build_object(
        'orders', COALESCE(result, '[]'::jsonb),
        'totalOrders', total_count,
        'page', page,
        'limit', page_limit,
        'hasMore', (page * page_limit) < total_count,
        'empty', (result IS NULL OR jsonb_array_length(result) = 0)
    );
END;
$$;


ALTER FUNCTION "public"."myorders"("query" "text", "page" integer, "page_limit" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."on_product_delete"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
declare
  variant record;
begin
  -- Delete related variants
  delete from public.product_variants where product_id = old.id;

  -- Optionally queue image cleanup manually (if you still use storage_cleanup_queue)
  -- insert into storage_cleanup_queue(bucket, path)
  -- select 'user', regexp_replace(value::text, '^/user/', '')
  -- from jsonb_array_elements(image)
  -- where image is not null;

  return old;
end;
$$;


ALTER FUNCTION "public"."on_product_delete"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."on_variant_change"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
  old_images jsonb;
  new_images jsonb;
  old_paths text[];
  new_paths text[];
  img text;
BEGIN
  IF (tg_op = 'DELETE') THEN
    RETURN old;
  END IF;

  IF (tg_op = 'UPDATE') THEN
    old_images := old.image;
    new_images := new.image;

    IF old_images IS DISTINCT FROM new_images THEN
      SELECT array_agg(value::text)
      INTO old_paths
      FROM jsonb_array_elements(coalesce(old_images, '[]'::jsonb));

      SELECT array_agg(value::text)
      INTO new_paths
      FROM jsonb_array_elements(coalesce(new_images, '[]'::jsonb));
    END IF;

    RETURN new;
  END IF;

  RETURN NULL;
END;
$$;


ALTER FUNCTION "public"."on_variant_change"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."ordershare"("p_share" "uuid") RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
declare
  result jsonb;
begin
  select jsonb_build_object(
    'order', to_jsonb(o),
    'products', coalesce(jsonb_agg(op) filter (where op.id is not null), '[]'::jsonb)
  )
  into result
  from public.orders o
  left join public.order_products op on op.order_id = o.id
  where o.share = p_share
  group by o.id;

  return result;
end;
$$;


ALTER FUNCTION "public"."ordershare"("p_share" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."posproduct"("search" "text" DEFAULT ''::"text", "category" "text" DEFAULT 'all'::"text") RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
declare
  user_id uuid := auth.uid();
  ts_query text;
  result jsonb;
  category_filter text := nullif(trim(category), '');
  search_filter text := nullif(trim(search), '');
begin
  if user_id is null then
    return jsonb_build_object(
      'error', 'User not authenticated',
      'products', '[]'::jsonb,
      'empty', true
    );
  end if;

  -- Build tsquery only if we have a search term
  if search_filter is not null then
    ts_query := array_to_string(
      array_agg(regexp_replace(word, '''', '''''', 'g') || ':*'), ' & '
    )
    from unnest(string_to_array(search_filter, ' ')) as word;
  else
    ts_query := '';
  end if;

  with base as (
    select
      p.*,
      json_agg(pv.*) as variants
    from product p
    left join product_variants pv on pv.product_id = p.id
    where p.seller_id = user_id
      and (
        category_filter is null or category_filter = 'all' or p.category = category_filter
      )
      and (
        ts_query = '' or p.query @@ to_tsquery('simple', ts_query)
      )
    group by p.id
    order by p.id desc
    limit 40
  )
  select jsonb_agg(to_jsonb(base)) into result
  from base;

  return jsonb_build_object(
    'products', coalesce(result, '[]'::jsonb),
    'error', null,
    'empty', (result is null or jsonb_array_length(result) = 0)
  );
end;
$$;


ALTER FUNCTION "public"."posproduct"("search" "text", "category" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."process_return"("p_order_id" "text", "p_items" "jsonb", "p_reason" "text") RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  v_seller_uuid uuid := auth.uid();
  v_item jsonb;
  v_product_id uuid;
  v_qty int;
BEGIN
  -- Verify seller owns the order
  IF NOT EXISTS (SELECT 1 FROM orders WHERE id = p_order_id AND "sellerID" = v_seller_uuid) THEN
    RAISE EXCEPTION 'Order not found or access denied';
  END IF;

  -- Iterate through items
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    v_product_id := (v_item->>'productId')::uuid;
    v_qty := (v_item->>'quantity')::int;

    -- Update specific product
    -- This will fire the existing trigger fn_create_transaction_on_product_return
    UPDATE order_products
    SET returned_quantity = returned_quantity + v_qty,
        is_fully_returned = (returned_quantity + v_qty) >= quantity,
        returned_at = now()
    WHERE order_id = p_order_id AND product_id = v_product_id;
  END LOOP;

  RETURN jsonb_build_object('success', true);
END;
$$;


ALTER FUNCTION "public"."process_return"("p_order_id" "text", "p_items" "jsonb", "p_reason" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."process_return"("p_order_id" "text", "p_return_type" "text", "p_items" "jsonb", "p_reason" "text") RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
declare
  v_seller_uuid uuid := auth.uid();
  v_item jsonb;
  v_product_id uuid;
  v_qty int;
begin
  -- Verify seller owns the order
  if not exists (select 1 from orders where id = p_order_id and "sellerID" = v_seller_uuid) then
    raise exception 'Order not found or access denied';
  end if;

  if p_return_type = 'full' then
    -- Mark order as refunded
    update orders
    set is_refunded = true,
        refund_reason = p_reason,
        refunded_at = now()
    where id = p_order_id;

    -- Update all products to fully returned
    update order_products
    set returned_quantity = quantity,
        is_fully_returned = true
    where order_id = p_order_id;

  elsif p_return_type = 'partial' then
    -- Iterate through items
    for v_item in select * from jsonb_array_elements(p_items)
    loop
      v_product_id := (v_item->>'productId')::uuid;
      v_qty := (v_item->>'quantity')::int;

      -- Update specific product
      update order_products
      set returned_quantity = returned_quantity + v_qty,
          is_fully_returned = (returned_quantity + v_qty) >= quantity
      where order_id = p_order_id and product_id = v_product_id;
    end loop;
  end if;

  return jsonb_build_object('success', true);
end;
$$;


ALTER FUNCTION "public"."process_return"("p_order_id" "text", "p_return_type" "text", "p_items" "jsonb", "p_reason" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."process_return"("p_order_id" "uuid", "p_return_type" "text", "p_items" "jsonb", "p_reason" "text") RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  v_auth_uid uuid := auth.uid();
  v_user_id uuid;
  v_item jsonb;
  v_product_id uuid;
  v_qty int;
BEGIN

  -- 1️⃣ Get internal user ID from auth_id
  SELECT id
  INTO v_user_id
  FROM users
  WHERE auth_id = v_auth_uid;

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User not found';
  END IF;

  -- 2️⃣ Verify seller owns the order using users.id
  IF NOT EXISTS (
    SELECT 1
    FROM orders
    WHERE id = p_order_id
      AND "sellerID" = v_user_id
  ) THEN
    RAISE EXCEPTION 'Order not found or access denied';
  END IF;

  -- 3️⃣ Handle full return
  IF p_return_type = 'full' THEN

    UPDATE orders
    SET is_refunded = true,
        refund_reason = p_reason,
        refunded_at = now()
    WHERE id = p_order_id;

    UPDATE order_products
    SET returned_quantity = quantity,
        is_fully_returned = true,
        returned_at = now()
    WHERE order_id = p_order_id;

  -- 4️⃣ Handle partial return
  ELSIF p_return_type = 'partial' THEN

    FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
    LOOP
      v_product_id := (v_item->>'productId')::uuid;
      v_qty := (v_item->>'quantity')::int;

      -- Prevent over-return
      UPDATE order_products
      SET returned_quantity = LEAST(returned_quantity + v_qty, quantity),
          is_fully_returned = (returned_quantity + v_qty) >= quantity,
          returned_at = now()
      WHERE order_id = p_order_id
        AND product_id = v_product_id;
    END LOOP;

  ELSE
    RAISE EXCEPTION 'Invalid return type';
  END IF;

  RETURN jsonb_build_object('success', true);

END;
$$;


ALTER FUNCTION "public"."process_return"("p_order_id" "uuid", "p_return_type" "text", "p_items" "jsonb", "p_reason" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."product_generate_slug"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $_$
declare
    base_slug text;
    final_slug text;
    counter int := 1;
begin
    base_slug := lower(NEW.name || '-' || NEW.category);
    base_slug := regexp_replace(base_slug, '[^a-z0-9]+', '-', 'g');
    base_slug := regexp_replace(base_slug, '^-+|-+$', '', 'g');

    final_slug := base_slug;

    while exists (
        select 1 from product 
        where seller_id = NEW.seller_id 
          and slug = final_slug
    ) loop
        counter := counter + 1;
        final_slug := base_slug || '-' || counter;
    end loop;

    NEW.slug := final_slug;
    return NEW;
end;
$_$;


ALTER FUNCTION "public"."product_generate_slug"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."product_insert_category"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
begin
    -- Insert category for the seller if it doesn't exist
    insert into product_categories (seller_id, category)
    values (NEW.seller_id, NEW.category)
    on conflict do nothing;  -- avoids duplicates

    return NEW;
end;
$$;


ALTER FUNCTION "public"."product_insert_category"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."purge_deleted_products"() RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
begin
    delete from product_variants
    where product_id in (
        select id from product
        where deleted_at is not null 
          and deleted_at < now() - interval '7 days'
    );

    delete from product
    where deleted_at is not null 
      and deleted_at < now() - interval '7 days';
end;
$$;


ALTER FUNCTION "public"."purge_deleted_products"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."reduce_product_and_variant_quantity"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    -- Reduce quantity for the variant
    UPDATE product_variants
    SET qty = qty - NEW.quantity
    WHERE id = NEW.variant_id
    AND qty >= NEW.quantity;

    IF NOT FOUND THEN
        RAISE NOTICE 'Variant % does not have enough stock!', NEW.variant_id;
    END IF;

    -- Reduce quantity for the main product
    UPDATE product
    SET qty = qty - NEW.quantity
    WHERE id = NEW.product_id
    AND qty >= NEW.quantity;

    IF NOT FOUND THEN
        RAISE NOTICE 'Product % does not have enough stock!', NEW.product_id;
    END IF;

    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."reduce_product_and_variant_quantity"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."reduce_product_variant_quantity"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    v_variant product_variants%ROWTYPE;
BEGIN
    -- Lock the product_variant row for update to prevent race conditions
    SELECT *
    INTO v_variant
    FROM product_variants
    WHERE id = NEW.product_id
    FOR UPDATE;

    -- Decrease the quantity
    v_variant.quantity := v_variant.quantity - NEW.quantity;

    -- Prevent overselling
    IF v_variant.quantity < 0 THEN
        RAISE EXCEPTION 'Insufficient stock for product variant %', NEW.product_id;
    END IF;

    -- Update the quantity
    UPDATE product_variants
    SET quantity = v_variant.quantity
    WHERE id = NEW.product_id;

    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."reduce_product_variant_quantity"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."restock_full_order"("orderid" "text") RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    rec order_products%ROWTYPE;
BEGIN
    FOR rec IN SELECT * FROM order_products WHERE order_id = orderId LOOP
        -- Calculate remaining quantity to restock
        IF rec.returned_quantity < rec.quantity THEN
            INSERT INTO restock_queue(product_variant_id, quantity)
            VALUES (rec.product_id, rec.quantity - rec.returned_quantity);
            
            -- Optionally update directly:
            -- UPDATE product_variants
            -- SET quantity = quantity + (rec.quantity - rec.returned_quantity)
            -- WHERE id = rec.product_id;
        END IF;
    END LOOP;
END;
$$;


ALTER FUNCTION "public"."restock_full_order"("orderid" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."restock_product_variant"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    restock_qty int;
BEGIN
    -- Calculate the difference between new and old returned quantity
    restock_qty := NEW.returned_quantity - OLD.returned_quantity;

    IF restock_qty > 0 THEN
        -- For very high traffic, insert into queue instead of direct update
        INSERT INTO restock_queue(product_variant_id, quantity)
        VALUES (NEW.product_id, restock_qty);

        -- Optional: direct atomic update if traffic is moderate
        -- UPDATE product_variants
        -- SET quantity = quantity + restock_qty
        -- WHERE id = NEW.product_id;
    END IF;

    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."restock_product_variant"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."restock_product_variant_on_partial_return"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
declare
  delta int;
begin
  delta := new.returned_quantity - old.returned_quantity;

  if delta <= 0 then
    return new;
  end if;

  if new.returned_quantity > new.quantity then
    raise exception '❌ Returned quantity (%) cannot exceed sold quantity (%).',
      new.returned_quantity, new.quantity;
  end if;

  update product_variants
  set quantity = quantity + delta
  where id = new.product_id;

  return new;
end;
$$;


ALTER FUNCTION "public"."restock_product_variant_on_partial_return"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."restore_product"("pid" bigint) RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
begin
  update public.product
  set deleted_at = null, updated_at = now()
  where id = pid and deleted_at is not null;

  update public.product_variants
  set deleted_at = null, updated_at = now()
  where product_id = pid and deleted_at is not null;
end;
$$;


ALTER FUNCTION "public"."restore_product"("pid" bigint) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."seller_balance"() RETURNS "json"
    LANGUAGE "sql" SECURITY DEFINER
    AS $$
select json_build_object(
  'get',  coalesce(sum(case when balance < 0 then abs(balance) end), 0),
  'give', coalesce(sum(case when balance > 0 then balance end), 0)
)
from user_balance
where "sellerID" = auth.uid();
$$;


ALTER FUNCTION "public"."seller_balance"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."seller_recent_orders"("p_username" "text") RETURNS "json"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    target_seller_id uuid;
    recent_orders json;
BEGIN
    -- Get Seller ID from Username
    SELECT id INTO target_seller_id
    FROM public.users
    WHERE username = p_username;

    IF target_seller_id IS NULL THEN
        RETURN json_build_object('error', 'User not found');
    END IF;

    -- Fetch Recent 5 Orders
    SELECT json_agg(t) INTO recent_orders FROM (
        SELECT
            o.id,
            o."createdAt" AS created_at,
            o."totalAmount" AS total_amount,
            CASE
                WHEN o.is_refunded = true THEN 'Refunded'
                WHEN o.paid >= o."totalAmount" THEN 'Paid'
                ELSE 'Pending'
            END AS status,

            -- ✅ FIXED: SUM(quantity) instead of COUNT(*)
            (
                SELECT COALESCE(SUM(op.quantity), 0)
                FROM order_products op
                WHERE op.order_id = o.id
            ) AS item_count,

            -- buyer name
            o."userName" AS name

        FROM orders o
        WHERE o."sellerID" = target_seller_id
        ORDER BY o."createdAt" DESC
        LIMIT 5
    ) t;

    RETURN COALESCE(recent_orders, '[]'::json);
END;
$$;


ALTER FUNCTION "public"."seller_recent_orders"("p_username" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."seller_stock"("stock_filter" "text" DEFAULT 'both'::"text", "category_filter" "text" DEFAULT NULL::"text") RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
declare
    result jsonb := '{}';
begin

    -- Build JSON object with category keys
    select jsonb_object_agg(category, items)
    into result
    from (
        select
            p.category,
            jsonb_agg(
                jsonb_build_object(
                    'product_name', p.name,
                    'variant_id', v.id,
                    'brand', v.brand,
                    'quantity', v.quantity,
                    'purchase_price', v.purchase_price,
                    'color', coalesce(v.color, '[]'::jsonb)
                )
            ) as items
        from product p
        join product_variants v on v.product_id = p.id
        where p.seller_id = auth.uid()
          and p.deleted_at is null
          and v.deleted_at is null

          -- category filter
          and (category_filter is null OR p.category = category_filter)

          -- stock filter
          and (
                (stock_filter = 'out'  and v.quantity = 0) OR
                (stock_filter = 'low'  and v.quantity = 1) OR
                (stock_filter = 'both' and v.quantity IN (0,1))
              )
        group by p.category
        order by p.category
    ) t;

    return result;
end;
$$;


ALTER FUNCTION "public"."seller_stock"("stock_filter" "text", "category_filter" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."seller_stock_rows"("stock_filter" "text" DEFAULT 'both'::"text", "category_filter" "text" DEFAULT NULL::"text") RETURNS TABLE("category" "text", "product_name" "text", "variant_id" "uuid", "brand" "text", "quantity" integer, "purchase_price" numeric)
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
    SET LOCAL max_parallel_workers_per_gather = 4;

    RETURN QUERY
    SELECT
        p.category,
        p.name AS product_name,
        v.id AS variant_id,
        v.brand,
        v.quantity,
        v.purchase_price
    FROM public.product p
    JOIN public.product_variants v ON v.product_id = p.id
    WHERE p.seller_id = auth.uid()
      AND p.deleted_at IS NULL
      AND v.deleted_at IS NULL
      AND (category_filter IS NULL OR p.category = category_filter)
      AND (
            (stock_filter = 'out'  AND v.quantity = 0) OR
            (stock_filter = 'low'  AND v.quantity = 1) OR
            (stock_filter = 'both' AND v.quantity IN (0,1))
          )
    ORDER BY p.category, p.name, v.brand;
END;
$$;


ALTER FUNCTION "public"."seller_stock_rows"("stock_filter" "text", "category_filter" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."seller_stocks"("stock_filter" "text" DEFAULT 'both'::"text", "category_filter" "text" DEFAULT NULL::"text") RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
    SET LOCAL max_parallel_workers_per_gather = 4;

    RETURN (
        SELECT jsonb_agg(
            jsonb_build_object(
                'category', category,
                'items', items
            )
        )
        FROM (
            SELECT 
                p.category,
                jsonb_agg(
                    jsonb_build_object(
                        'product_name', p.name,
                        'variant_id', v.id,
                        'brand', v.brand,
                        'quantity', v.quantity,
                        'purchase_price', v.purchase_price
                    )
                    ORDER BY p.name, v.brand
                ) AS items
            FROM public.product p
            JOIN public.product_variants v ON v.product_id = p.id
            WHERE p.seller_id = auth.uid()
              AND p.deleted_at IS NULL
              AND v.deleted_at IS NULL
              AND (category_filter IS NULL OR p.category = category_filter)
              AND (
                    (stock_filter = 'out'  AND v.quantity = 0) OR
                    (stock_filter = 'low'  AND v.quantity = 1) OR
                    (stock_filter = 'both' AND v.quantity IN (0,1))
                  )
            GROUP BY p.category
            ORDER BY p.category
        ) AS grouped
    );
END;
$$;


ALTER FUNCTION "public"."seller_stocks"("stock_filter" "text", "category_filter" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."seller_top"("p_username" "text") RETURNS "json"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    target_seller_id uuid;
    top_brands json;
    top_categories json;
    top_products json;
BEGIN
    SELECT id INTO target_seller_id 
    FROM public.users 
    WHERE username = p_username;

    IF target_seller_id IS NULL THEN
        RETURN json_build_object('error', 'User not found');
    END IF;

    -- Top Brands
    SELECT json_agg(
        json_build_object(
            'name', brand,
            'sales_count', sales_count,
            'total_amount', total_amount,
            'image',
                '/assets/brands/' ||
                lower(replace(brand, ' ', '-')) ||
                '.png'
        )
    )
    INTO top_brands
    FROM (
        SELECT 
            op.brand AS brand,
            COUNT(*) AS sales_count,
            SUM(op.price * op.quantity) AS total_amount
        FROM order_products op
        JOIN orders o ON o.id = op.order_id
        WHERE o."sellerID" = target_seller_id
          AND op.brand IS NOT NULL
        GROUP BY op.brand
        ORDER BY total_amount DESC
        LIMIT 5
    ) t;

    -- Top Categories
    SELECT json_agg(
        json_build_object(
            'name', category,
            'sales_count', sales_count,
            'total_amount', total_amount,
            'image',
                '/assets/categories/' ||
                lower(replace(category, ' ', '-')) ||
                '.png'
        )
    )
    INTO top_categories
    FROM (
        SELECT 
            op.category AS category,
            COUNT(*) AS sales_count,
            SUM(op.price * op.quantity) AS total_amount
        FROM order_products op
        JOIN orders o ON o.id = op.order_id
        WHERE o."sellerID" = target_seller_id
          AND op.category IS NOT NULL
        GROUP BY op.category
        ORDER BY total_amount DESC
        LIMIT 5
    ) t;

    -- Top Products
   -- Top Products (Group by product_id)
SELECT json_agg(
    json_build_object(
        'product_id', product_id,
        'name', name,
        'image', image,
        'sales_count', sales_count,
        'total_amount', total_amount
    )
)
INTO top_products
FROM (
    SELECT 
        op.product_id,

        -- Choose the most common name for the product
        MODE() WITHIN GROUP (ORDER BY op.name) AS name,

        -- Pick the first non-null, non-empty image
        (
            SELECT img 
            FROM (
                SELECT op2.image AS img
                FROM order_products op2
                WHERE op2.product_id = op.product_id
                AND op2.image IS NOT NULL
                AND op2.image <> ''
                AND op2.image <> '[]'
                LIMIT 1
            ) img_sub
        ) AS image,

        SUM(op.quantity) AS sales_count,
        SUM(op.price * op.quantity) AS total_amount

    FROM order_products op
    JOIN orders o ON o.id = op.order_id
    WHERE o."sellerID" = target_seller_id
    GROUP BY op.product_id
    ORDER BY total_amount DESC
    LIMIT 5
) t;


    -- FINAL RETURN
    RETURN json_build_object(
        'top_brands', COALESCE(top_brands, '[]'::json),
        'top_categories', COALESCE(top_categories, '[]'::json),
        'top_products', COALESCE(top_products, '[]'::json)
    );
END;
$$;


ALTER FUNCTION "public"."seller_top"("p_username" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."seller_transactions_list"() RETURNS "json"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
begin
  return (
    select json_agg(
      json_build_object(
        'id', ub."sellerID" || '-' || ub."userPhone",
        'userName', COALESCE(u_info."userName", ''),
        'userPhone', ub."userPhone",
        'lastTransaction', COALESCE(t.last_tx, now()),
        'balance', ub.balance
      )
    )
    from user_balance ub

    -- last transaction date
    left join (
      select "userPhone", max("createdAt") as last_tx
      from transactions
      where "sellerID" = auth.uid()
      group by "userPhone"
    ) t
    on t."userPhone" = ub."userPhone"

    -- get userName from orders
    left join (
      select distinct on ("userPhone")
        "userPhone",
        "userName"
      from orders
      where "sellerID" = auth.uid()
      order by "userPhone", "createdAt" desc
    ) u_info
    on u_info."userPhone" = ub."userPhone"

    where ub."sellerID" = auth.uid()
  );
end;
$$;


ALTER FUNCTION "public"."seller_transactions_list"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."seller_transactions_list"("filter" "text" DEFAULT 'all'::"text") RETURNS "json"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
begin
  return (
    select json_agg(result ORDER BY result."lastTransaction" DESC)
    from (
      select 
        ub."sellerID" || '-' || ub."userPhone" as id,
        COALESCE(u_info."userName", '') as "userName",
        ub."userPhone",
        COALESCE(t.last_tx, now()) as "lastTransaction",
        ub.balance
      from user_balance ub

      -- latest transaction date
      left join (
        select "userPhone", max("createdAt") as last_tx
        from transactions
        where "sellerID" = auth.uid()
        group by "userPhone"
      ) t
        on t."userPhone" = ub."userPhone"

      -- latest name from orders
      left join (
        select distinct on ("userPhone")
          "userPhone",
          "userName"
        from orders
        where "sellerID" = auth.uid()
        order by "userPhone", "createdAt" desc
      ) u_info
        on u_info."userPhone" = ub."userPhone"

      where ub."sellerID" = auth.uid()
      and (
        filter = 'all'
        or (filter = 'get' and ub.balance < 0)
        or (filter = 'give' and ub.balance > 0)
      )
    ) as result
  );
end;
$$;


ALTER FUNCTION "public"."seller_transactions_list"("filter" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."sellerorders"("query" "text" DEFAULT NULL::"text") RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  seller_uuid uuid := auth.uid();
  result jsonb;
  total_count bigint;
BEGIN
  IF seller_uuid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  query := nullif(trim(query), '');

  -- COUNT
  SELECT COUNT(*)
  INTO total_count
  FROM orders o
  WHERE o."sellerID" = seller_uuid
    AND (
      query IS NULL
      OR o.id ILIKE '%' || query || '%'
      OR o."userName" ILIKE '%' || query || '%'
      OR o."userPhone" ILIKE '%' || query || '%'
    );

  WITH filtered_orders AS (
    SELECT *
    FROM orders o
    WHERE o."sellerID" = seller_uuid
      AND (
        query IS NULL
        OR o.id ILIKE '%' || query || '%'
        OR o."userName" ILIKE '%' || query || '%'
        OR o."userPhone" ILIKE '%' || query || '%'
      )
    ORDER BY o."createdAt" DESC
    LIMIT 40
  )
  SELECT jsonb_agg(
    jsonb_build_object(
      'id', fo.id,
      'userName', fo."userName",
      'userPhone', fo."userPhone",
      'userAddress', fo."userAddress",
      'sellerID', fo."sellerID",
      'sellerName', fo."sellerName",
      'sellerUserName', fo."sellerUserName",
      'sellerPhone', fo."sellerPhone",
      'sellerGSTIN', fo."sellerGSTIN",
      'sellerAddress', fo."sellerAddress",
      'totalAmount', fo."totalAmount",
      'paid', fo.paid,
      'mode', fo.mode,
      'note', fo.note,
      'createdAt', fo."createdAt",
      'updatedAt', fo."updatedAt",

      ----------------------------------------------------------
      -- ORDER-LEVEL DELIVERY STATUS
      ----------------------------------------------------------
      'delivered',
      EXISTS (
        SELECT 1
        FROM order_products op
        WHERE op.order_id = fo.id
          AND op.returned_at IS NULL
      ),

      ----------------------------------------------------------
      -- ORDER-LEVEL RETURN TYPE
      ----------------------------------------------------------
      'orderReturnType',
      (
        SELECT CASE
          WHEN EVERY(op.returned_quantity = op.quantity) THEN 'full'
          WHEN SUM(CASE WHEN op.returned_quantity > 0 THEN 1 ELSE 0 END) > 0 THEN 'partial'
          ELSE 'none'
        END
        FROM order_products op
        WHERE op.order_id = fo.id
      ),

      ----------------------------------------------------------
      -- PRODUCTS ARRAY
      ----------------------------------------------------------
      'products',
      (
        SELECT jsonb_agg(
          jsonb_build_object(
            'id', op.id,
            'orderID', op.order_id,
            'productID', op.product_id,

            -- Correct image rule: empty → null
            'image',
              CASE
                WHEN op.image IS NULL OR op.image = '' OR op.image = '[]' THEN NULL
                ELSE op.image
              END,

            'name', op.name,
            'category', op.category,
            'brand', op.brand,
            'color', op.color,
            'storage', op.storage,
            'serial', op.serial,
            'price', op.price,
            'purchasePrice', op.purchase_price,
            'quantity', op.quantity,
            'returnedQuantity', op.returned_quantity,
            'returnedAt', op.returned_at,
            'isFullyReturned', op.is_fully_returned,

            ----------------------------------------------------------
            -- PRODUCT RETURN TYPE
            ----------------------------------------------------------
            'returnType',
            CASE
              WHEN op.returned_quantity = 0 THEN 'none'
              WHEN op.returned_quantity < op.quantity THEN 'partial'
              ELSE 'full'
            END,

            'total', (op.price * op.quantity),
            'createdAt', op.created_at,
            'updatedAt', op.updated_at
          )
        )
        FROM order_products op
        WHERE op.order_id = fo.id
      )
    )
  )
  INTO result
  FROM filtered_orders fo;

  RETURN jsonb_build_object(
    'orders', COALESCE(result, '[]'::jsonb),
    'totalOrders', total_count,
    'empty', (result IS NULL OR jsonb_array_length(result) = 0)
  );
END;
$$;


ALTER FUNCTION "public"."sellerorders"("query" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."session"() RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    uid uuid := auth.uid();
    user_row jsonb;
    role_row jsonb;
BEGIN
    IF uid IS NULL THEN
        RETURN jsonb_build_object(
            'user', null,
            'navigation', '[]'::jsonb,
            'command', null
        );
    END IF;

    -- 🔥 FIX: use auth_id instead of id
    SELECT to_jsonb(u.*)
    INTO user_row
    FROM public.users u
    WHERE u.auth_id = uid;

    IF user_row IS NULL THEN
        RETURN jsonb_build_object(
            'user', null,
            'navigation', '[]'::jsonb,
            'command', null
        );
    END IF;

    SELECT jsonb_build_object(
        'navigation', COALESCE(r.navigation, '[]'::jsonb),
        'command', r.command
    )
    INTO role_row
    FROM public.roles r
    WHERE r.id = (user_row->>'role')::bigint;

    RETURN jsonb_build_object(
        'user', user_row,
        'navigation', role_row->'navigation',
        'command', role_row->'command'
    );
END;
$$;


ALTER FUNCTION "public"."session"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."session"("user_id" "uuid") RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
declare
    user_row jsonb;
    role_row jsonb;
begin
    select to_jsonb(u.*)
    into user_row
    from public.users u
    where u.auth_id = user_id;  -- 🔥 FIX

    if user_row is null then
        return jsonb_build_object(
            'user', null,
            'navigation', '[]'::jsonb,
            'command', null
        );
    end if;

    select to_jsonb(r.*)
    into role_row
    from public.roles r
    where r.id = (user_row->>'role')::bigint;  -- 🔥 FIXED RELATION

    return jsonb_build_object(
        'user', user_row,
        'navigation', coalesce(role_row->'navigation', '[]'::jsonb),
        'command', role_row->'command'
    );
end;
$$;


ALTER FUNCTION "public"."session"("user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."set_orders_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW."updatedAt" = NOW();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."set_orders_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."set_show_whatsapp_by_role"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
begin
  -- On INSERT: auto-enable for seller/admin
  if tg_op = 'INSERT' then
    if new.role in (2, 3) then
      new."showWhatsapp" := true;
    end if;
  end if;

  -- On UPDATE: if role changes to seller/admin, auto-enable once
  if tg_op = 'UPDATE' then
    if new.role in (2, 3) and old.role not in (2, 3) then
      new."showWhatsapp" := true;
    end if;
  end if;

  return new;
end;
$$;


ALTER FUNCTION "public"."set_show_whatsapp_by_role"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."set_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
begin
  new.updated_at := now();
  return new;
end;
$$;


ALTER FUNCTION "public"."set_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."set_user_balance_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
begin
    if
        new.balance is distinct from old.balance
        or new.total_credit is distinct from old.total_credit
        or new.total_debit is distinct from old.total_debit
    then
        new.updated_at := now();
    end if;

    return new;
end;
$$;


ALTER FUNCTION "public"."set_user_balance_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."sitemap_users"() RETURNS TABLE("username" "text", "avatar" "text", "cover" "text", "updated_at" timestamp with time zone)
    LANGUAGE "sql" SECURITY DEFINER
    AS $$
  SELECT username, avatar, cover, updated_at
  FROM users
  WHERE username IS NOT NULL
    AND active = true;
$$;


ALTER FUNCTION "public"."sitemap_users"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."soft_delete_product"("pid" bigint) RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
begin
  update public.product
  set deleted_at = now(), updated_at = now()
  where id = pid and deleted_at is null;

  update public.product_variants
  set deleted_at = now(), updated_at = now()
  where product_id = pid and deleted_at is null;
end;
$$;


ALTER FUNCTION "public"."soft_delete_product"("pid" bigint) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."sync_variants_cache"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
begin
  update public.product
  set variants_cache = (
    select jsonb_agg(to_jsonb(v) - 'product_id')
    from public.product_variants v
    where v.product_id = coalesce(new.product_id, old.product_id)
    and v.deleted_at is null
  ),
  updated_at = now()
  where id = coalesce(new.product_id, old.product_id);
  return new;
end;
$$;


ALTER FUNCTION "public"."sync_variants_cache"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."trg_create_transactions_after_order_insert"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    IF NEW."totalAmount" > 0 THEN
        INSERT INTO transactions (
            id, "userPhone", "sellerID", "orderID",
            amount, type, mode, note,
            origin_type, origin_id,
            "createdAt", "updatedAt"
        )
        VALUES (
            gen_random_uuid(),
            NEW."userPhone",
            NEW."sellerID",
            NEW.id,
            NEW."totalAmount",
            'debit',
            NEW.mode,
            'Order created: total amount',
            'order_debit',
            NEW.id::text,
            now(),
            now()
        )
        ON CONFLICT DO NOTHING;
    END IF;

    IF NEW.paid IS NOT NULL AND NEW.paid > 0 THEN
        INSERT INTO transactions (
            id, "userPhone", "sellerID", "orderID",
            amount, type, mode, note,
            origin_type, origin_id,
            "createdAt", "updatedAt"
        )
        VALUES (
            gen_random_uuid(),
            NEW."userPhone",
            NEW."sellerID",
            NEW.id,
            NEW.paid,
            'credit',
            NEW.mode,
            'Order payment received',
            'order_credit',
            NEW.id::text,
            now(),
            now()
        )
        ON CONFLICT DO NOTHING;
    END IF;

    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."trg_create_transactions_after_order_insert"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."trg_financial_engine"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    v_user_id uuid;
    v_user_phone text;
    v_seller_id uuid;
    v_delta numeric;
    v_return_qty integer;
    base_ts timestamptz;
BEGIN
    ------------------------------------------------------------------
    -- ORDER EVENTS
    ------------------------------------------------------------------
    IF TG_TABLE_NAME = 'orders' THEN
        v_user_id := NEW.user_id;

        IF v_user_id IS NULL THEN
            RAISE EXCEPTION 'Order % has null user_id', NEW.id;
        END IF;

        -- ORDER CREATED
        IF TG_OP = 'INSERT' THEN
            base_ts := clock_timestamp();

            IF NEW."totalAmount" > 0 THEN
                INSERT INTO public.transactions (
                    id, user_id, "userPhone", "sellerID", "orderID",
                    amount, type, mode, note,
                    origin_type, origin_id,
                    "createdAt", updated_at
                )
                VALUES (
                    gen_random_uuid(), NEW.user_id,
                    NEW."userPhone", NEW."sellerID", NEW.id,
                    NEW."totalAmount", 'debit',
                    NEW.mode, 'Order created',
                    'order_debit', NEW.id::text,
                    base_ts, base_ts
                );
            END IF;

            IF NEW.paid IS NOT NULL AND NEW.paid > 0 THEN
                INSERT INTO public.transactions (
                    id, user_id, "userPhone", "sellerID", "orderID",
                    amount, type, mode, note,
                    origin_type, origin_id,
                    "createdAt", updated_at
                )
                VALUES (
                    gen_random_uuid(), NEW.user_id,
                    NEW."userPhone", NEW."sellerID", NEW.id,
                    NEW.paid, 'credit',
                    NEW.mode, 'Order payment',
                    'order_credit', NEW.id::text,
                    base_ts + interval '1 millisecond',
                    base_ts + interval '1 millisecond'
                );
            END IF;
        END IF;

        -- PAYMENT UPDATED
        IF TG_OP = 'UPDATE' AND NEW.paid IS DISTINCT FROM OLD.paid THEN
            v_delta := NEW.paid - COALESCE(OLD.paid, 0);

            IF v_delta > 0 THEN
                base_ts := clock_timestamp();

                INSERT INTO public.transactions (
                    id, user_id, "userPhone", "sellerID", "orderID",
                    amount, type, mode, note,
                    origin_type, origin_id,
                    "createdAt", updated_at
                )
                VALUES (
                    gen_random_uuid(), NEW.user_id,
                    NEW."userPhone", NEW."sellerID", NEW.id,
                    v_delta, 'credit',
                    NEW.mode, 'Payment update',
                    'order_payment_delta', NEW.id::text,
                    base_ts, base_ts
                );
            END IF;
        END IF;

        -- FULL REFUND
        IF TG_OP = 'UPDATE'
           AND NEW.is_refunded = TRUE
           AND OLD.is_refunded IS DISTINCT FROM TRUE THEN
            base_ts := clock_timestamp();

            INSERT INTO public.transactions (
                id, user_id, "userPhone", "sellerID", "orderID",
                amount, type, mode, note,
                origin_type, origin_id,
                "createdAt", updated_at
            )
            VALUES (
                gen_random_uuid(), NEW.user_id,
                NEW."userPhone", NEW."sellerID", NEW.id,
                NEW."totalAmount", 'credit',
                NEW.mode,
                COALESCE(NEW.refund_reason, 'Full refund'),
                'order_full_refund', NEW.id::text,
                base_ts, base_ts
            );
        END IF;

        RETURN NEW;
    END IF;

    ------------------------------------------------------------------
    -- PRODUCT RETURN EVENTS
    ------------------------------------------------------------------
    IF TG_TABLE_NAME = 'order_products'
       AND TG_OP = 'UPDATE'
       AND NEW.returned_quantity > OLD.returned_quantity THEN

        SELECT o.user_id, o."userPhone", o."sellerID"
        INTO v_user_id, v_user_phone, v_seller_id
        FROM public.orders o
        WHERE o.id = NEW.order_id;

        IF v_user_id IS NULL THEN
            RAISE EXCEPTION 'Order % not found or has null user_id', NEW.order_id;
        END IF;

        v_return_qty := NEW.returned_quantity - OLD.returned_quantity;
        base_ts := clock_timestamp();

        INSERT INTO public.transactions (
            id, user_id, "userPhone", "sellerID", "orderID",
            amount, type, note,
            origin_type, origin_id, origin_qty,
            "createdAt", updated_at
        )
        VALUES (
            gen_random_uuid(),
            v_user_id,
            v_user_phone,
            v_seller_id,
            NEW.order_id,
            v_return_qty * NEW.price,
            'credit',
            'Product returned',
            'product_return',
            NEW.id::text,
            v_return_qty,
            base_ts,
            base_ts
        );

        RETURN NEW;
    END IF;

    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."trg_financial_engine"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."trg_order_full_refund_atomic"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    v_order_row orders%ROWTYPE;
BEGIN
    -- Check if is_refunded changed to true
    IF NEW.is_refunded = TRUE AND (OLD.is_refunded IS DISTINCT FROM TRUE OR OLD.is_refunded IS NULL) THEN
        SELECT * INTO v_order_row
        FROM orders
        WHERE id = NEW.id;

        -- 1️⃣ Update stock for all order_products
        UPDATE product_variants pv
        SET quantity = pv.quantity + op.quantity - op.returned_quantity
        FROM order_products op
        WHERE op.order_id = NEW.id
          AND pv.id = op.product_id;

        -- 2️⃣ Insert credit transaction for full refund
        INSERT INTO transactions (
            id, "userPhone", "sellerID", "orderID",
            amount, type, mode, note,
            origin_type, origin_id,
            "createdAt", updated_at -- Note: transactions table uses updated_at (snake_case)
        )
        VALUES (
            gen_random_uuid(),
            v_order_row."userPhone",
            v_order_row."sellerID",
            NEW.id,
            v_order_row."totalAmount", -- Correctly quoted
            'credit',
            v_order_row.mode,
            COALESCE(v_order_row.refund_reason, 'Full order refund'),
            'order_full_refund',
            NEW.id::text,
            now(),
            now()
        )
        ON CONFLICT DO NOTHING;
    END IF;

    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."trg_order_full_refund_atomic"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."trg_product_return_atomic"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    v_new_return integer;
    v_refund_amount numeric(10,2);
    v_order_row orders%ROWTYPE;
BEGIN
    -- Only act if returned_quantity increased
    IF NEW.returned_quantity > OLD.returned_quantity THEN
        v_new_return := NEW.returned_quantity - OLD.returned_quantity;
        v_refund_amount := v_new_return * NEW.price;

        -- Get order info
        SELECT * INTO v_order_row
        FROM orders
        WHERE id = NEW.order_id;

        -- 1️⃣ Update stock atomically
        UPDATE product_variants
        SET quantity = quantity + v_new_return
        WHERE id = NEW.product_id
        RETURNING *;

        -- 2️⃣ Insert transaction (idempotent)
        INSERT INTO transactions (
            id, "userPhone", "sellerID", "orderID",
            amount, type, mode, note,
            origin_type, origin_id, origin_qty,
            "createdAt", "updatedAt"
        )
        VALUES (
            gen_random_uuid(),
            v_order_row."userPhone",
            v_order_row."sellerID",
            NEW.order_id,
            v_refund_amount,
            'credit',
            v_order_row.mode,
            'Refund for returned product: ' || NEW.name,
            'product_return',
            NEW.id::text,
            NEW.returned_quantity,
            now(),
            now()
        )
        ON CONFLICT DO NOTHING; -- avoid duplicates

        -- 3️⃣ Mark fully returned if all qty returned
        IF NEW.returned_quantity = NEW.quantity THEN
            NEW.is_fully_returned := true;
        END IF;
    END IF;

    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."trg_product_return_atomic"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_brand"("p_id" "uuid", "p_name" "text", "p_keywords" "text"[] DEFAULT NULL::"text"[], "p_description" "text" DEFAULT NULL::"text", "p_image" "text" DEFAULT NULL::"text") RETURNS "public"."brands"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
declare
    updated_brand brands%rowtype;
begin
    -- Permission check
    if not exists (
        select 1
        from get_user_permissions(auth.uid())
        where permission_key = 'update:brand'
    ) then
        raise exception 'Permission denied';
    end if;

    -- Unique name check excluding current brand
    if exists (
        select 1 from brands
        where name = p_name
        and id <> p_id
    ) then
        raise exception 'Brand with this name already exists';
    end if;

    -- Update
    update brands
    set 
        name = p_name,
        keywords = coalesce(p_keywords, keywords),
        description = coalesce(p_description, description),
        image = coalesce(p_image, image),
        updated_at = now()
    where id = p_id
    returning * into updated_brand;

    return updated_brand;
end;
$$;


ALTER FUNCTION "public"."update_brand"("p_id" "uuid", "p_name" "text", "p_keywords" "text"[], "p_description" "text", "p_image" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_categories"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    -- Insert the user_id + category into product_categories
    -- ON CONFLICT DO NOTHING prevents duplicates
    INSERT INTO public.product_categories(user_id, category)
    VALUES (NEW.user_id, NEW.category)
    ON CONFLICT (user_id, category) DO NOTHING;

    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_categories"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_category"("p_id" "uuid", "p_name" "text", "p_keywords" "text"[] DEFAULT NULL::"text"[], "p_description" "text" DEFAULT NULL::"text", "p_image" "text" DEFAULT NULL::"text") RETURNS "public"."categories"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
declare
    updated_cat categories%rowtype;
begin
    -- Permission check
    if not exists (
        select 1
        from get_user_permissions(auth.uid())
        where permission_key = 'update:category'
    ) then
        raise exception 'Permission denied';
    end if;

    -- Check if name is unique (exclude current record)
    if exists (
        select 1 from categories
        where name = p_name
        and id <> p_id
    ) then
        raise exception 'Category with this name already exists';
    end if;

    -- Update category
    update categories
    set 
        name = p_name,
        keywords = coalesce(p_keywords, keywords),
        description = coalesce(p_description, description),
        image = coalesce(p_image, image),
        updated_at = now()
    where id = p_id
    returning * into updated_cat;

    return updated_cat;
end;
$$;


ALTER FUNCTION "public"."update_category"("p_id" "uuid", "p_name" "text", "p_keywords" "text"[], "p_description" "text", "p_image" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_content_comment_count"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    IF TG_OP = 'INSERT' AND NOT NEW.is_deleted THEN
        UPDATE public.user_content 
        SET comment_count = comment_count + 1 
        WHERE id = NEW.content_id;
    ELSIF TG_OP = 'UPDATE' AND OLD.is_deleted = false AND NEW.is_deleted = true THEN
        UPDATE public.user_content 
        SET comment_count = GREATEST(comment_count - 1, 0) 
        WHERE id = NEW.content_id;
    ELSIF TG_OP = 'UPDATE' AND OLD.is_deleted = true AND NEW.is_deleted = false THEN
        UPDATE public.user_content 
        SET comment_count = comment_count + 1 
        WHERE id = NEW.content_id;
    ELSIF TG_OP = 'DELETE' AND NOT OLD.is_deleted THEN
        UPDATE public.user_content 
        SET comment_count = GREATEST(comment_count - 1, 0) 
        WHERE id = OLD.content_id;
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$;


ALTER FUNCTION "public"."update_content_comment_count"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_content_counters"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- Increment counter when new like/comment is added
        IF TG_TABLE_NAME = 'content_likes' THEN
            UPDATE public.content 
            SET like_count = like_count + 1 
            WHERE id = NEW.content_id;
        ELSIF TG_TABLE_NAME = 'content_comments' THEN
            UPDATE public.content 
            SET comment_count = comment_count + 1 
            WHERE id = NEW.content_id;
        END IF;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        -- Decrement counter when like/comment is removed
        IF TG_TABLE_NAME = 'content_likes' THEN
            UPDATE public.content 
            SET like_count = GREATEST(like_count - 1, 0) 
            WHERE id = OLD.content_id;
        ELSIF TG_TABLE_NAME = 'content_comments' THEN
            UPDATE public.content 
            SET comment_count = GREATEST(comment_count - 1, 0) 
            WHERE id = OLD.content_id;
        END IF;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$;


ALTER FUNCTION "public"."update_content_counters"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_content_engagement"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    -- Update like count
    IF TG_OP = 'INSERT' AND NEW.interaction_type = 'like' THEN
        UPDATE public.user_content 
        SET like_count = like_count + 1 
        WHERE id = NEW.content_id;
    ELSIF TG_OP = 'DELETE' AND OLD.interaction_type = 'like' THEN
        UPDATE public.user_content 
        SET like_count = GREATEST(like_count - 1, 0) 
        WHERE id = OLD.content_id;
    END IF;
    
    -- Update bookmark count
    IF TG_OP = 'INSERT' AND NEW.interaction_type = 'bookmark' THEN
        UPDATE public.user_content 
        SET bookmark_count = bookmark_count + 1 
        WHERE id = NEW.content_id;
    ELSIF TG_OP = 'DELETE' AND OLD.interaction_type = 'bookmark' THEN
        UPDATE public.user_content 
        SET bookmark_count = GREATEST(bookmark_count - 1, 0) 
        WHERE id = OLD.content_id;
    END IF;
    
    -- Update share count
    IF TG_OP = 'INSERT' AND NEW.interaction_type = 'share' THEN
        UPDATE public.user_content 
        SET share_count = share_count + 1 
        WHERE id = NEW.content_id;
    END IF;
    
    -- Update view count
    IF TG_OP = 'INSERT' AND NEW.interaction_type = 'view' THEN
        UPDATE public.user_content 
        SET view_count = view_count + 1 
        WHERE id = NEW.content_id;
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$;


ALTER FUNCTION "public"."update_content_engagement"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_product_query"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
begin
  new.query :=
    setweight(to_tsvector('simple', coalesce(new.name, '')), 'A') ||
    setweight(to_tsvector('simple', coalesce(new.category, '')), 'B') ||
    setweight(to_tsvector('simple', coalesce(new.description, '')), 'C') ||
    setweight(to_tsvector('simple', coalesce(new.compatibility, '')), 'D');
  return new;
end;
$$;


ALTER FUNCTION "public"."update_product_query"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_product_variants_jsonb"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
begin
  update product
  set variants = (
    select jsonb_agg(
      jsonb_build_object(
        'id', v.id,
        'brand', v.brand,
        'color', v.color,
        'image', v.image,
        'storage', v.storage,
        'purchase_price', v.purchase_price,
        'wholesale_price', v.wholesale_price,
        'price', v.price,
        'mrp', v.mrp,
        'quantity', v.quantity,
        'created_at', v.created_at,
        'updated_at', v.updated_at,
        'deleted_at', v.deleted_at
      )
    )
    from product_variants v
    where v.product_id = NEW.product_id
  )
  where id = NEW.product_id;

  return NEW;
end;
$$;


ALTER FUNCTION "public"."update_product_variants_jsonb"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_tag_usage_count"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.content_tags 
        SET usage_count = usage_count + 1 
        WHERE id = NEW.tag_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.content_tags 
        SET usage_count = GREATEST(usage_count - 1, 0) 
        WHERE id = OLD.tag_id;
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$;


ALTER FUNCTION "public"."update_tag_usage_count"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_user_balance"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    current_total_credit numeric;
    current_total_debit numeric;
    current_balance numeric;
    affected_seller uuid;
    affected_user text;
    affected_user_id uuid;
BEGIN
    -- Determine affected seller/user
    affected_seller := coalesce(NEW."sellerID", OLD."sellerID");
    affected_user   := coalesce(NEW."userPhone", OLD."userPhone");

    -- Resolve permanent user_id
    SELECT id INTO affected_user_id
    FROM public.users
    WHERE phone = affected_user;

    IF affected_user_id IS NULL THEN
        RAISE EXCEPTION 'Balance engine: user not found for phone %', affected_user;
    END IF;

    -- Prevent race conditions
    perform pg_advisory_xact_lock(hashtext(affected_seller || affected_user));

    -- Ensure row exists (NOW includes user_id)
    insert into public.user_balance(
        user_id,
        "sellerID",
        "userPhone",
        total_credit,
        total_debit,
        balance
    )
    values (
        affected_user_id,
        affected_seller,
        affected_user,
        0, 0, 0
    )
    on conflict ("sellerID", "userPhone") do nothing;

    -- Recalculate totals
    select 
        coalesce(sum(case when type='credit' then amount else 0 end),0),
        coalesce(sum(case when type='debit' then amount else 0 end),0),
        coalesce(sum(case when type='credit' then amount else -amount end),0)
    into current_total_credit, current_total_debit, current_balance
    from public.transactions
    where "sellerID" = affected_seller
      and "userPhone" = affected_user;

    -- Update balance
    update public.user_balance
    set 
        total_credit = current_total_credit,
        total_debit  = current_total_debit,
        balance      = current_balance
    where "sellerID" = affected_seller
      and "userPhone" = affected_user;

    return coalesce(NEW, OLD);
END;
$$;


ALTER FUNCTION "public"."update_user_balance"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_variants_cache"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
begin
    update product
    set variants_cache = (
        select json_agg(
            json_build_object(
                'id', v.id,
                'brand', v.brand,
                'image', v.image,
                'color', v.color,
                'storage', v.storage,
                'purchase_price', v.purchase_price,
                'wholesale_price', v.wholesale_price,
                'price', v.price,
                'mrp', v.mrp,
                'quantity', v.quantity,
                'created_at', v.created_at,
                'updated_at', v.updated_at,
                'deleted_at', v.deleted_at
            )
        )
        from product_variants v
        where v.product_id = NEW.product_id
          and v.deleted_at is null
    )
    where id = NEW.product_id;
    return NEW;
end;
$$;


ALTER FUNCTION "public"."update_variants_cache"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_variants_cache_from_product"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
begin
    update product
    set variants_cache = (
        select json_agg(
            json_build_object(
                'id', v.id,
                'brand', v.brand,
                'image', v.image,
                'color', v.color,
                'storage', v.storage,
                'purchase_price', v.purchase_price,
                'wholesale_price', v.wholesale_price,
                'price', v.price,
                'mrp', v.mrp,
                'quantity', v.quantity,
                'created_at', v.created_at,
                'updated_at', v.updated_at,
                'deleted_at', v.deleted_at
            )
        )
        from product_variants v
        where v.product_id = NEW.id
          and v.deleted_at is null
    )
    where id = NEW.id;

    return NEW;
end;
$$;


ALTER FUNCTION "public"."update_variants_cache_from_product"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_variants_cache_from_variant_safe"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
begin
    perform set_config('session_replication_role', 'replica', true);

    update product
    set variants_cache = (
        select json_agg(
            json_build_object(
                'id', v.id,
                'brand', v.brand,
                'image', v.image,
                'color', v.color,
                'storage', v.storage,
                'purchase_price', v.purchase_price,
                'wholesale_price', v.wholesale_price,
                'price', v.price,
                'mrp', v.mrp,
                'quantity', v.quantity,
                'created_at', v.created_at,
                'updated_at', v.updated_at,
                'deleted_at', v.deleted_at
            )
        )
        from product_variants v
        where v.product_id = NEW.product_id
          and v.deleted_at is null
    )
    where id = NEW.product_id;

    perform set_config('session_replication_role', 'origin', true);

    return NEW;
end;
$$;


ALTER FUNCTION "public"."update_variants_cache_from_variant_safe"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_variants_from_product_safe"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  -- This function will auto-update the "variants" column for future product updates
  -- Logic to update "variants" will happen here automatically when the trigger fires
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_variants_from_product_safe"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_variants_from_variant"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  -- This function will auto-update the parent product's "variants" column for future variant changes
  -- Logic will execute automatically when the trigger fires
  RETURN NULL;
END;
$$;


ALTER FUNCTION "public"."update_variants_from_variant"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."updateproduct"("payload" "jsonb") RETURNS "uuid"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  _seller_id uuid := auth.uid();
  _product_id uuid := (payload->>'id')::uuid;
  _variant jsonb;
  _name text := trim(payload->>'name');
  _category text := trim(payload->>'category');
  _slug text;
  _thumbnail text := nullif(trim(payload->>'thumbnail'), '');
BEGIN
  -- 🔐 Permission check
  IF NOT EXISTS (
    SELECT 1 FROM get_user_permissions(_seller_id)
    WHERE permission_key = 'update:product'
  ) THEN
    RAISE EXCEPTION 'Permission denied: update:product';
  END IF;

  -- 📝 Validate
  IF _product_id IS NULL THEN
    RAISE EXCEPTION 'Product ID is required';
  END IF;

  IF _name IS NULL OR _name = '' THEN
    RAISE EXCEPTION 'Product name is required';
  END IF;

  IF _category IS NULL OR _category = '' THEN
    RAISE EXCEPTION 'Product category is required';
  END IF;

  -- 🧩 Ownership check
  IF NOT EXISTS (
    SELECT 1 FROM public.product
    WHERE id = _product_id
      AND seller_id = _seller_id
      AND deleted_at IS NULL
  ) THEN
    RAISE EXCEPTION 'You do not own this product or it does not exist';
  END IF;

  -- 🏷 Generate slug
  _slug := LOWER(regexp_replace(_name || '-' || _category, '[^a-zA-Z0-9]+', '-', 'g'));

  -- 🔎 Check slug uniqueness
  IF EXISTS (
    SELECT 1
    FROM public.product
    WHERE seller_id = _seller_id
      AND slug = _slug
      AND id <> _product_id
      AND deleted_at IS NULL
  ) THEN
    RAISE EXCEPTION 'You already have a product with this name in the same category';
  END IF;

  -- 🛠 Update the product
  UPDATE public.product
  SET
    name = _name,
    slug = _slug,
    description = payload->>'description',
    compatibility = payload->>'compatibility',
    category = _category,
    thumbnail = CASE
      WHEN payload ? 'thumbnail' THEN _thumbnail
      ELSE thumbnail
    END,
    updated_at = NOW()
  WHERE id = _product_id;

  -----------------------------------------------------------------
  -- VARIANT SYNC: UPDATE, INSERT, DELETE (NO UUID CHANGE)
  -----------------------------------------------------------------

  -- 1️⃣ Delete variants that the client removed
  DELETE FROM public.product_variants
  WHERE product_id = _product_id
    AND id NOT IN (
      SELECT (elem->>'id')::uuid
      FROM jsonb_array_elements(payload->'variants') elem
      WHERE elem ? 'id' AND elem->>'id' <> ''
    );

  -- 2️⃣ Loop through incoming variants
  FOR _variant IN SELECT jsonb_array_elements(payload->'variants')
  LOOP
    IF (_variant->>'id') IS NOT NULL AND (_variant->>'id') <> '' THEN
      
      -- 2A️⃣ Update existing variant
      UPDATE public.product_variants
      SET
        brand = _variant->>'brand',
        image = _variant->'image',
        color = _variant->'color',
        storage = _variant->>'storage',
        purchase_price = (_variant->>'purchase_price')::numeric,
        wholesale_price = (_variant->>'wholesale_price')::numeric,
        price = (_variant->>'price')::numeric,
        mrp = (_variant->>'mrp')::numeric,
        quantity = COALESCE((_variant->>'quantity')::int, 0),
        updated_at = NOW()
      WHERE id = (_variant->>'id')::uuid;

    ELSE
      -- 2B️⃣ Insert new variant (no ID passed)
      INSERT INTO public.product_variants (
        product_id, brand, image, color, storage,
        purchase_price, wholesale_price, price, mrp, quantity
      ) VALUES (
        _product_id,
        _variant->>'brand',
        _variant->'image',
        _variant->'color',
        _variant->>'storage',
        (_variant->>'purchase_price')::numeric,
        (_variant->>'wholesale_price')::numeric,
        (_variant->>'price')::numeric,
        (_variant->>'mrp')::numeric,
        COALESCE((_variant->>'quantity')::int, 0)
      );

    END IF;

  END LOOP;

  RETURN _product_id;
END;
$$;


ALTER FUNCTION "public"."updateproduct"("payload" "jsonb") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."user"("username" "text") RETURNS "json"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $_$
DECLARE
    result json;
BEGIN
    SELECT json_build_object(
        'name', u.name,
        'username', u.username,
        'gender', u.gender,
        'bio', u.bio,
        'address', u.address,
        'avatar', u.avatar,
        'cover', u.cover,
        'verified', u.verified,
        'active', u.active,
        'role', u.role
    )
    INTO result
    FROM public.users u
    WHERE u.username = $1   -- ← function argument (username)
    LIMIT 1;

    RETURN result;
END;
$_$;


ALTER FUNCTION "public"."user"("username" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."user_profile"("username" "text") RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    usr jsonb;
    role_row jsonb;
BEGIN
    -- 1. Fetch full user by username
    SELECT to_jsonb(u.*)
    INTO usr
    FROM public.users u
    WHERE u.username = user_profile.username;

    IF usr IS NULL THEN
        RETURN jsonb_build_object(
            'user', null,
            'navigation', '[]'::jsonb,
            'command', null,
            'tabs', '[]'::jsonb
        );
    END IF;

    -- 2. Fetch role metadata from roles table
    SELECT jsonb_build_object(
        'navigation', COALESCE(r.navigation, '[]'::jsonb),
        'command', r.command,
        'tabs', COALESCE(r.tabs, '[]'::jsonb)
    )
    INTO role_row
    FROM public.roles r
    WHERE r.id = (usr->>'role')::bigint;

    RETURN jsonb_build_object(
        'user', usr,
        'navigation', role_row->'navigation',
        'command', role_row->'command',
        'tabs', role_row->'tabs'
    );
END;
$$;


ALTER FUNCTION "public"."user_profile"("username" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."usercategories"("username" "text") RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  v_target_user_id uuid;
  v_total_count int := 0;
  v_categories jsonb := '[]'::jsonb;
  v_top jsonb := '[]'::jsonb;
BEGIN
  -- Step 1: Find seller ID
  SELECT id INTO v_target_user_id
  FROM public.users
  WHERE public.users.username = usercategories.username
  LIMIT 1;

  IF v_target_user_id IS NULL THEN
    RETURN jsonb_build_object(
      'categories', v_categories,
      'top', v_top
    );
  END IF;

  -- Step 2: Total count for 'All'
  SELECT COUNT(*) INTO v_total_count
  FROM product p
  WHERE p.seller_id = v_target_user_id;

  -- Step 3: Build the full category list with "All" first
  SELECT jsonb_agg(category_item ORDER BY sort_order, sort_name)
  INTO v_categories
  FROM (
    SELECT jsonb_build_object('category', 'All', 'count', v_total_count) AS category_item, 0 AS sort_order, 'All' AS sort_name
    UNION ALL
    SELECT
      jsonb_build_object('category', p.category, 'count', COUNT(*)) AS category_item,
      1 AS sort_order,
      p.category AS sort_name
    FROM product p
    WHERE p.seller_id = v_target_user_id
    GROUP BY p.category
  ) category_list
  ;

  -- Step 4: Build the top list with "All" first, then the top 10 categories by product count
  SELECT COALESCE(jsonb_agg(top_item ORDER BY sort_order, sort_count DESC, sort_name ASC), '[]'::jsonb)
  INTO v_top
  FROM (
    SELECT
      jsonb_build_object('category', 'All', 'count', v_total_count) AS top_item,
      0 AS sort_order,
      v_total_count AS sort_count,
      'All' AS sort_name
    UNION ALL
    SELECT
      jsonb_build_object('category', ranked.category, 'count', ranked.count) AS top_item,
      1 AS sort_order,
      ranked.count AS sort_count,
      ranked.category AS sort_name
    FROM (
      SELECT p.category, COUNT(*) AS count
      FROM product p
      WHERE p.seller_id = v_target_user_id
      GROUP BY p.category
      ORDER BY COUNT(*) DESC, p.category ASC
      LIMIT 10
    ) ranked
  ) top_categories;

  RETURN jsonb_build_object(
    'categories', COALESCE(v_categories, '[]'::jsonb),
    'top', v_top
  );
END;
$$;


ALTER FUNCTION "public"."usercategories"("username" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."userproducts"("username" "text", "search" "text" DEFAULT ''::"text", "category" "text" DEFAULT 'all'::"text", "page" integer DEFAULT 1, "limit_count" integer DEFAULT 42) RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  target_user_id uuid;
  ts_query text;
  result jsonb;
  total_count int := 0;
  total_pages int := 1;
  offset_val int := (GREATEST(page, 1) - 1) * limit_count;
  category_filter text := nullif(trim(lower(category)), '');
  search_filter text := nullif(trim(search), '');
BEGIN
  -- Step 1: Find user ID
  SELECT u.id INTO target_user_id
  FROM public.users AS u
  WHERE u.username = userproducts.username
  LIMIT 1;

  IF target_user_id IS NULL THEN
    RETURN jsonb_build_object(
      'error', 'User not found',
      'products', '[]'::jsonb,
      'empty', true,
      'total', 0,
      'page', page,
      'limit', limit_count,
      'total_pages', 0
    );
  END IF;

  -- Step 2: Build tsquery if search exists
  IF search_filter IS NOT NULL THEN
    ts_query := (
      SELECT array_to_string(
        array_agg(regexp_replace(word, '''', '''''', 'g') || ':*'),
        ' & '
      )
      FROM unnest(string_to_array(search_filter, ' ')) AS word
    );
  ELSE
    ts_query := '';
  END IF;

  -- Step 3: Count total matching products
  SELECT COUNT(DISTINCT p.id)
  INTO total_count
  FROM product p
  WHERE p.seller_id = target_user_id
    AND (category_filter IS NULL OR category_filter = 'all' OR lower(p.category) = category_filter)
    AND (ts_query = '' OR p.query @@ to_tsquery('simple', ts_query));

  total_pages := CEIL(GREATEST(total_count, 1)::numeric / GREATEST(limit_count, 1)::numeric);

  -- Step 4: Fetch paginated products
  WITH base AS (
    SELECT
      p.*,
      json_agg(
        jsonb_strip_nulls(to_jsonb(pv) - 'purchase_price' - 'wholesale_price')
      ) AS variants
    FROM product p
    LEFT JOIN product_variants pv ON pv.product_id = p.id
    WHERE p.seller_id = target_user_id
      AND (category_filter IS NULL OR category_filter = 'all' OR lower(p.category) = category_filter)
      AND (ts_query = '' OR p.query @@ to_tsquery('simple', ts_query))
    GROUP BY p.id
    ORDER BY p.created_at DESC
    OFFSET offset_val
    LIMIT limit_count
  )
  SELECT jsonb_agg(to_jsonb(base)) INTO result FROM base;

  -- Step 5: Return result
  RETURN jsonb_build_object(
    'products', COALESCE(result, '[]'::jsonb),
    'error', NULL,
    'empty', (result IS NULL OR jsonb_array_length(result) = 0),
    'total', total_count,
    'page', page,
    'limit', limit_count,
    'total_pages', total_pages
  );
END;
$$;


ALTER FUNCTION "public"."userproducts"("username" "text", "search" "text", "category" "text", "page" integer, "limit_count" integer) OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."customers" (
    "phone" "text" NOT NULL,
    "name" "text" NOT NULL,
    "address" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "id" bigint NOT NULL
);


ALTER TABLE "public"."customers" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."customers_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "public"."customers_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."customers_id_seq" OWNED BY "public"."customers"."id";



CREATE TABLE IF NOT EXISTS "public"."frp" (
    "id" integer NOT NULL,
    "title" "text" NOT NULL,
    "img" "text" NOT NULL,
    "link" "text" NOT NULL,
    "count" integer DEFAULT 0,
    "created_at" timestamp without time zone DEFAULT "now"()
);


ALTER TABLE "public"."frp" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."frp_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "public"."frp_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."frp_id_seq" OWNED BY "public"."frp"."id";



CREATE TABLE IF NOT EXISTS "public"."notifications" (
    "id" bigint NOT NULL,
    "user_id" "text" NOT NULL,
    "type" "text" NOT NULL,
    "data" "jsonb" NOT NULL,
    "is_read" boolean DEFAULT false NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."notifications" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."notifications_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "public"."notifications_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."notifications_id_seq" OWNED BY "public"."notifications"."id";



CREATE TABLE IF NOT EXISTS "public"."order_products" (
    "id" bigint NOT NULL,
    "order_id" "text" NOT NULL,
    "product_id" "uuid",
    "name" "text" NOT NULL,
    "category" "text",
    "brand" "text",
    "color" "jsonb",
    "storage" "text",
    "serial" "jsonb",
    "price" numeric(10,2) NOT NULL,
    "purchase_price" numeric(10,2) NOT NULL,
    "quantity" integer DEFAULT 1 NOT NULL,
    "returned_quantity" integer DEFAULT 0 NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "is_fully_returned" boolean DEFAULT false,
    "image" "text",
    "returned_at" timestamp with time zone,
    CONSTRAINT "order_products_return_check" CHECK ((("returned_quantity" <= "quantity") AND ("returned_quantity" >= 0)))
);


ALTER TABLE "public"."order_products" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."order_products_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "public"."order_products_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."order_products_id_seq" OWNED BY "public"."order_products"."id";



CREATE TABLE IF NOT EXISTS "public"."orders" (
    "id" "text" DEFAULT (((EXTRACT(epoch FROM "now"()))::bigint || '-'::"text") || "upper"("substr"("encode"("extensions"."gen_random_bytes"(2), 'hex'::"text"), 1, 4))) NOT NULL,
    "userName" "text" NOT NULL,
    "userPhone" "text" NOT NULL,
    "userAddress" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "sellerID" "uuid" NOT NULL,
    "sellerName" "text" NOT NULL,
    "sellerUserName" "text" NOT NULL,
    "sellerPhone" "text",
    "sellerGSTIN" "text",
    "sellerAddress" "jsonb",
    "createdAt" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT "now"() NOT NULL,
    "paid" numeric,
    "totalAmount" numeric NOT NULL,
    "mode" "text",
    "note" "text",
    "is_refunded" boolean DEFAULT false,
    "refund_reason" "text",
    "refunded_at" timestamp with time zone,
    "share" "uuid" DEFAULT "gen_random_uuid"(),
    "user_id" "uuid" NOT NULL
);


ALTER TABLE "public"."orders" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."permissions" (
    "id" bigint NOT NULL,
    "key" "text" NOT NULL,
    "label" "text" NOT NULL,
    "category" "text",
    "description" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."permissions" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."permissions_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "public"."permissions_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."permissions_id_seq" OWNED BY "public"."permissions"."id";



CREATE TABLE IF NOT EXISTS "public"."product" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "seller_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "slug" "text" NOT NULL,
    "description" "text",
    "compatibility" "text",
    "category" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "deleted_at" timestamp with time zone,
    "query" "tsvector",
    "thumbnail" "text"
);


ALTER TABLE "public"."product" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."product_categories" (
    "seller_id" "uuid" NOT NULL,
    "category" "text" NOT NULL
);


ALTER TABLE "public"."product_categories" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."product_variants" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "product_id" "uuid" NOT NULL,
    "brand" "text" NOT NULL,
    "image" "jsonb",
    "color" "jsonb",
    "storage" "text" NOT NULL,
    "purchase_price" numeric(10,2) NOT NULL,
    "wholesale_price" numeric(10,2) NOT NULL,
    "price" numeric(10,2) NOT NULL,
    "mrp" numeric(10,2) NOT NULL,
    "quantity" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "deleted_at" timestamp with time zone
);


ALTER TABLE "public"."product_variants" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."quotes" (
    "id" integer NOT NULL,
    "quote" "text" NOT NULL,
    "username" "text" NOT NULL,
    "lastModifiedDateTime" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."quotes" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."quotes_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "public"."quotes_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."quotes_id_seq" OWNED BY "public"."quotes"."id";



CREATE TABLE IF NOT EXISTS "public"."repair" (
    "id" integer NOT NULL,
    "title" "text" NOT NULL,
    "img" "text" NOT NULL,
    "link" "text" NOT NULL,
    "count" integer DEFAULT 0,
    "created_at" timestamp without time zone DEFAULT "now"()
);


ALTER TABLE "public"."repair" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."repair_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "public"."repair_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."repair_id_seq" OWNED BY "public"."repair"."id";



CREATE TABLE IF NOT EXISTS "public"."role_permissions" (
    "role_id" bigint NOT NULL,
    "permission_id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."role_permissions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."roles" (
    "id" bigint NOT NULL,
    "role" "text" NOT NULL,
    "tabs" "jsonb",
    "slug" "jsonb",
    "navigation" "jsonb",
    "command" "json"
);


ALTER TABLE "public"."roles" OWNER TO "postgres";


ALTER TABLE "public"."roles" ALTER COLUMN "id" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME "public"."roles_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."team_members" (
    "id" bigint NOT NULL,
    "team_id" "text" NOT NULL,
    "team_username" "text" NOT NULL,
    "user_id" "text" NOT NULL,
    "job_title" "text",
    "status" "text" DEFAULT 'pending'::"text" NOT NULL,
    "invited_by" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."team_members" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."team_members_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "public"."team_members_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."team_members_id_seq" OWNED BY "public"."team_members"."id";



CREATE TABLE IF NOT EXISTS "public"."teams" (
    "id" bigint NOT NULL,
    "name" "text" NOT NULL,
    "owner_id" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."teams" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."teams_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "public"."teams_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."teams_id_seq" OWNED BY "public"."teams"."id";



CREATE TABLE IF NOT EXISTS "public"."transactions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "userPhone" "text" NOT NULL,
    "sellerID" "uuid" NOT NULL,
    "orderID" "text",
    "amount" numeric(10,2) NOT NULL,
    "type" "text" NOT NULL,
    "mode" "text",
    "note" "text",
    "createdAt" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "origin_type" "text",
    "origin_id" "text",
    "origin_qty" integer,
    "notes" "text",
    "user_id" "uuid" NOT NULL,
    CONSTRAINT "transactions_mode_check" CHECK ((("mode" IS NULL) OR ("mode" = ANY (ARRAY['cash'::"text", 'upi'::"text", 'card'::"text", 'bank'::"text", 'paylater'::"text"])))),
    CONSTRAINT "transactions_type_check" CHECK (("type" = ANY (ARRAY['credit'::"text", 'debit'::"text"])))
);


ALTER TABLE "public"."transactions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_balance" (
    "sellerID" "uuid" NOT NULL,
    "userPhone" "text" NOT NULL,
    "total_credit" numeric(10,2) DEFAULT 0 NOT NULL,
    "total_debit" numeric(10,2) DEFAULT 0 NOT NULL,
    "balance" numeric(10,2) DEFAULT 0 NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "user_id" "uuid" NOT NULL
);


ALTER TABLE "public"."user_balance" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_login_sessions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "session_id" "text" NOT NULL,
    "device_type" "text",
    "device_name" "text",
    "browser" "text",
    "browser_version" "text",
    "os" "text",
    "os_version" "text",
    "user_agent" "text",
    "ip_address" "inet",
    "location_country" "text",
    "location_city" "text",
    "location_region" "text",
    "location_lat" numeric(10,8),
    "location_lng" numeric(11,8),
    "isp" "text",
    "timezone" "text",
    "login_method" "text" DEFAULT 'phone_otp'::"text",
    "login_status" "text" DEFAULT 'success'::"text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "expires_at" timestamp with time zone,
    "last_activity" timestamp with time zone DEFAULT "now"(),
    "is_active" boolean DEFAULT true
);


ALTER TABLE "public"."user_login_sessions" OWNER TO "postgres";


COMMENT ON TABLE "public"."user_login_sessions" IS 'Tracks user login sessions with device and location information';



COMMENT ON COLUMN "public"."user_login_sessions"."device_type" IS 'Type of device: mobile, desktop, tablet';



COMMENT ON COLUMN "public"."user_login_sessions"."login_method" IS 'Method used for login: phone_otp, email, google, etc.';



COMMENT ON COLUMN "public"."user_login_sessions"."login_status" IS 'Status of login attempt: success, failed, blocked';



COMMENT ON COLUMN "public"."user_login_sessions"."is_active" IS 'Whether the session is currently active';



CREATE TABLE IF NOT EXISTS "public"."user_permissions" (
    "user_id" "uuid" NOT NULL,
    "permission_id" bigint NOT NULL,
    "is_granted" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."user_permissions" OWNER TO "postgres";


ALTER TABLE ONLY "public"."customers" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."customers_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."frp" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."frp_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."notifications" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."notifications_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."order_products" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."order_products_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."permissions" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."permissions_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."quotes" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."quotes_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."repair" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."repair_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."team_members" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."team_members_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."teams" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."teams_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."brands"
    ADD CONSTRAINT "brands_name_key" UNIQUE ("name");



ALTER TABLE ONLY "public"."brands"
    ADD CONSTRAINT "brands_pkey1" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."categories"
    ADD CONSTRAINT "categories_name_key" UNIQUE ("name");



ALTER TABLE ONLY "public"."categories"
    ADD CONSTRAINT "categories_pkey1" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."customers"
    ADD CONSTRAINT "customers_phone_key" UNIQUE ("phone");



ALTER TABLE ONLY "public"."customers"
    ADD CONSTRAINT "customers_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."frp"
    ADD CONSTRAINT "frp_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."order_products"
    ADD CONSTRAINT "order_products_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."orders"
    ADD CONSTRAINT "orders_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."permissions"
    ADD CONSTRAINT "permissions_key_key" UNIQUE ("key");



ALTER TABLE ONLY "public"."permissions"
    ADD CONSTRAINT "permissions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."product_categories"
    ADD CONSTRAINT "product_categories_pkey" PRIMARY KEY ("seller_id", "category");



ALTER TABLE ONLY "public"."product"
    ADD CONSTRAINT "product_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."product"
    ADD CONSTRAINT "product_seller_id_slug_key" UNIQUE ("seller_id", "slug");



ALTER TABLE ONLY "public"."product_variants"
    ADD CONSTRAINT "product_variants_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."product_variants"
    ADD CONSTRAINT "product_variants_product_id_brand_color_storage_key" UNIQUE ("product_id", "brand", "color", "storage");



ALTER TABLE ONLY "public"."quotes"
    ADD CONSTRAINT "quotes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."repair"
    ADD CONSTRAINT "repair_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."role_permissions"
    ADD CONSTRAINT "role_permissions_pkey" PRIMARY KEY ("role_id", "permission_id");



ALTER TABLE ONLY "public"."roles"
    ADD CONSTRAINT "roles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."team_members"
    ADD CONSTRAINT "team_members_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."team_members"
    ADD CONSTRAINT "team_members_team_id_user_id_key" UNIQUE ("team_id", "user_id");



ALTER TABLE ONLY "public"."teams"
    ADD CONSTRAINT "teams_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."transactions"
    ADD CONSTRAINT "transactions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_balance"
    ADD CONSTRAINT "user_balance_pkey" PRIMARY KEY ("sellerID", "userPhone");



ALTER TABLE ONLY "public"."user_login_sessions"
    ADD CONSTRAINT "user_login_sessions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_permissions"
    ADD CONSTRAINT "user_permissions_pkey" PRIMARY KEY ("user_id", "permission_id");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_phone_key1" UNIQUE ("phone");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_pkey1" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_username_key1" UNIQUE ("username");



CREATE UNIQUE INDEX "idx_customers_phone" ON "public"."customers" USING "btree" ("phone");



CREATE INDEX "idx_customers_phone_created_at" ON "public"."customers" USING "btree" ("phone", "created_at");



CREATE INDEX "idx_order_products_order" ON "public"."order_products" USING "btree" ("order_id");



CREATE INDEX "idx_order_products_product" ON "public"."order_products" USING "btree" ("product_id");



CREATE INDEX "idx_orders_seller" ON "public"."orders" USING "btree" ("sellerID");



CREATE UNIQUE INDEX "idx_orders_share" ON "public"."orders" USING "btree" ("share");



CREATE INDEX "idx_orders_userphone" ON "public"."orders" USING "btree" ("userPhone");



CREATE INDEX "idx_product_covering" ON "public"."product" USING "btree" ("seller_id", "category", "name") INCLUDE ("id") WHERE ("deleted_at" IS NULL);



CREATE INDEX "idx_product_seller_category_active" ON "public"."product" USING "btree" ("seller_id", "category") WHERE ("deleted_at" IS NULL);



CREATE INDEX "idx_transactions_order" ON "public"."transactions" USING "btree" ("orderID");



CREATE INDEX "idx_transactions_seller" ON "public"."transactions" USING "btree" ("sellerID");



CREATE INDEX "idx_transactions_type" ON "public"."transactions" USING "btree" ("type");



CREATE INDEX "idx_transactions_userphone" ON "public"."transactions" USING "btree" ("userPhone");



CREATE INDEX "idx_user_balance_seller" ON "public"."user_balance" USING "btree" ("sellerID");



CREATE INDEX "idx_user_balance_seller_updated" ON "public"."user_balance" USING "btree" ("sellerID", "updated_at" DESC);



CREATE INDEX "idx_user_balance_updated_at" ON "public"."user_balance" USING "btree" ("updated_at" DESC);



CREATE INDEX "idx_user_balance_updated_at_desc" ON "public"."user_balance" USING "btree" ("updated_at" DESC);



CREATE INDEX "idx_user_balance_user" ON "public"."user_balance" USING "btree" ("userPhone");



CREATE INDEX "idx_user_balance_user_updated" ON "public"."user_balance" USING "btree" ("userPhone", "updated_at" DESC);



CREATE INDEX "idx_user_login_sessions_created_at" ON "public"."user_login_sessions" USING "btree" ("created_at");



CREATE INDEX "idx_user_login_sessions_is_active" ON "public"."user_login_sessions" USING "btree" ("is_active");



CREATE INDEX "idx_user_login_sessions_last_activity" ON "public"."user_login_sessions" USING "btree" ("last_activity");



CREATE INDEX "idx_user_login_sessions_session_id" ON "public"."user_login_sessions" USING "btree" ("session_id");



CREATE INDEX "idx_user_login_sessions_user_id" ON "public"."user_login_sessions" USING "btree" ("user_id");



CREATE INDEX "idx_users_name_search" ON "public"."users" USING "gin" ("name" "public"."gin_trgm_ops");



CREATE INDEX "idx_users_phone" ON "public"."users" USING "btree" ("phone");



CREATE INDEX "idx_users_phone_created_at" ON "public"."users" USING "btree" ("phone", "created_at");



CREATE INDEX "idx_users_phone_search" ON "public"."users" USING "gin" ("phone" "public"."gin_trgm_ops");



CREATE INDEX "idx_variant_covering" ON "public"."product_variants" USING "btree" ("product_id", "quantity") INCLUDE ("id", "brand", "purchase_price") WHERE ("deleted_at" IS NULL);



CREATE INDEX "idx_variant_product_active" ON "public"."product_variants" USING "btree" ("product_id") WHERE ("deleted_at" IS NULL);



CREATE INDEX "idx_variant_quantity_active" ON "public"."product_variants" USING "btree" ("quantity") WHERE ("deleted_at" IS NULL);



CREATE INDEX "orders_sellerID_idx" ON "public"."orders" USING "btree" ("sellerID");



CREATE INDEX "product_query_idx" ON "public"."product" USING "gin" ("query");



CREATE INDEX "transactions_user_seller_created_idx" ON "public"."transactions" USING "btree" ("user_id", "sellerID", "createdAt" DESC);



CREATE INDEX "users_auth_id_idx" ON "public"."users" USING "btree" ("auth_id");



CREATE UNIQUE INDEX "ux_transactions_order_full_refund" ON "public"."transactions" USING "btree" ("origin_type", "origin_id") WHERE ("origin_type" = 'order_full_refund'::"text");



CREATE UNIQUE INDEX "ux_transactions_product_return" ON "public"."transactions" USING "btree" ("origin_type", "origin_id", "origin_qty") WHERE ("origin_type" = 'product_return'::"text");



CREATE OR REPLACE TRIGGER "trg_cleanup_empty_categories_delete" AFTER DELETE ON "public"."product" FOR EACH ROW EXECUTE FUNCTION "public"."cleanup_empty_categories"();



CREATE OR REPLACE TRIGGER "trg_cleanup_empty_categories_update" AFTER UPDATE ON "public"."product" FOR EACH ROW WHEN (((("old"."deleted_at" IS NULL) AND ("new"."deleted_at" IS NOT NULL)) OR ("old"."category" IS DISTINCT FROM "new"."category"))) EXECUTE FUNCTION "public"."cleanup_empty_categories"();



CREATE OR REPLACE TRIGGER "trg_create_transaction_after_order_insert" AFTER INSERT ON "public"."orders" FOR EACH ROW EXECUTE FUNCTION "public"."fn_create_transaction_after_order_insert"();

ALTER TABLE "public"."orders" DISABLE TRIGGER "trg_create_transaction_after_order_insert";



CREATE OR REPLACE TRIGGER "trg_create_transaction_on_paid_update" AFTER UPDATE OF "paid" ON "public"."orders" FOR EACH ROW EXECUTE FUNCTION "public"."fn_create_transaction_on_paid_update"();

ALTER TABLE "public"."orders" DISABLE TRIGGER "trg_create_transaction_on_paid_update";



CREATE OR REPLACE TRIGGER "trg_create_transaction_on_product_return" AFTER UPDATE OF "returned_quantity" ON "public"."order_products" FOR EACH ROW WHEN (("new"."returned_quantity" IS DISTINCT FROM "old"."returned_quantity")) EXECUTE FUNCTION "public"."fn_create_transaction_on_product_return"();

ALTER TABLE "public"."order_products" DISABLE TRIGGER "trg_create_transaction_on_product_return";



CREATE OR REPLACE TRIGGER "trg_financial_engine_orders" AFTER INSERT OR UPDATE ON "public"."orders" FOR EACH ROW EXECUTE FUNCTION "public"."trg_financial_engine"();



CREATE OR REPLACE TRIGGER "trg_financial_engine_products" AFTER UPDATE OF "returned_quantity" ON "public"."order_products" FOR EACH ROW EXECUTE FUNCTION "public"."trg_financial_engine"();



CREATE OR REPLACE TRIGGER "trg_handle_product_return_safe" AFTER UPDATE OF "returned_quantity" ON "public"."order_products" FOR EACH ROW WHEN (("new"."returned_quantity" IS DISTINCT FROM "old"."returned_quantity")) EXECUTE FUNCTION "public"."fn_handle_product_return_safe"();



CREATE OR REPLACE TRIGGER "trg_insert_product_category" AFTER INSERT OR UPDATE ON "public"."product" FOR EACH ROW WHEN (("new"."category" IS NOT NULL)) EXECUTE FUNCTION "public"."ensure_product_category_exists"();



CREATE OR REPLACE TRIGGER "trg_order_full_refund_atomic" AFTER UPDATE OF "is_refunded" ON "public"."orders" FOR EACH ROW WHEN ((("new"."is_refunded" IS DISTINCT FROM "old"."is_refunded") AND ("new"."is_refunded" = true))) EXECUTE FUNCTION "public"."trg_order_full_refund_atomic"();

ALTER TABLE "public"."orders" DISABLE TRIGGER "trg_order_full_refund_atomic";



CREATE OR REPLACE TRIGGER "trg_order_products_updated_at" BEFORE UPDATE ON "public"."order_products" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "trg_orders_updated_at" BEFORE UPDATE ON "public"."orders" FOR EACH ROW EXECUTE FUNCTION "public"."set_orders_updated_at"();



CREATE OR REPLACE TRIGGER "trg_product_cleanup" BEFORE DELETE ON "public"."product" FOR EACH ROW EXECUTE FUNCTION "public"."on_product_delete"();



CREATE OR REPLACE TRIGGER "trg_product_insert_category" BEFORE INSERT ON "public"."product" FOR EACH ROW EXECUTE FUNCTION "public"."product_insert_category"();



CREATE OR REPLACE TRIGGER "trg_reduce_variant_qty_after_insert" AFTER INSERT ON "public"."order_products" FOR EACH ROW EXECUTE FUNCTION "public"."fn_reduce_product_variant_quantity"();



CREATE OR REPLACE TRIGGER "trg_set_show_whatsapp_by_role" BEFORE INSERT OR UPDATE ON "public"."users" FOR EACH ROW EXECUTE FUNCTION "public"."set_show_whatsapp_by_role"();



CREATE OR REPLACE TRIGGER "trg_transactions_updated_at" BEFORE UPDATE ON "public"."transactions" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "trg_user_balance" AFTER INSERT OR DELETE OR UPDATE ON "public"."transactions" FOR EACH ROW EXECUTE FUNCTION "public"."update_user_balance"();



CREATE OR REPLACE TRIGGER "trg_user_balance_updated_at" BEFORE UPDATE ON "public"."user_balance" FOR EACH ROW EXECUTE FUNCTION "public"."set_user_balance_updated_at"();



CREATE OR REPLACE TRIGGER "trg_variant_cleanup" BEFORE DELETE OR UPDATE ON "public"."product_variants" FOR EACH ROW EXECUTE FUNCTION "public"."on_variant_change"();



CREATE OR REPLACE TRIGGER "trigger_product_slug" BEFORE INSERT ON "public"."product" FOR EACH ROW EXECUTE FUNCTION "public"."product_generate_slug"();



CREATE OR REPLACE TRIGGER "trigger_update_product_query" BEFORE INSERT OR UPDATE ON "public"."product" FOR EACH ROW EXECUTE FUNCTION "public"."update_product_query"();



ALTER TABLE ONLY "public"."order_products"
    ADD CONSTRAINT "order_products_order_fkey" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."order_products"
    ADD CONSTRAINT "order_products_product_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."product_variants"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."orders"
    ADD CONSTRAINT "orders_sellerID_fkey" FOREIGN KEY ("sellerID") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."orders"
    ADD CONSTRAINT "orders_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."product"
    ADD CONSTRAINT "product_seller_id_fkey" FOREIGN KEY ("seller_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."product_variants"
    ADD CONSTRAINT "product_variants_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."product"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."role_permissions"
    ADD CONSTRAINT "role_permissions_permission_id_fkey" FOREIGN KEY ("permission_id") REFERENCES "public"."permissions"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."role_permissions"
    ADD CONSTRAINT "role_permissions_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."transactions"
    ADD CONSTRAINT "transactions_seller_fkey" FOREIGN KEY ("sellerID") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."transactions"
    ADD CONSTRAINT "transactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."user_balance"
    ADD CONSTRAINT "user_balance_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."user_login_sessions"
    ADD CONSTRAINT "user_login_sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_permissions"
    ADD CONSTRAINT "user_permissions_permission_id_fkey" FOREIGN KEY ("permission_id") REFERENCES "public"."permissions"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_permissions"
    ADD CONSTRAINT "user_permissions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_auth_id_fkey" FOREIGN KEY ("auth_id") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_role_fkey1" FOREIGN KEY ("role") REFERENCES "public"."roles"("id") ON UPDATE CASCADE ON DELETE SET DEFAULT;



CREATE POLICY "Admin can modify permissions" ON "public"."permissions" USING ((EXISTS ( SELECT 1
   FROM "public"."users" "u"
  WHERE (("u"."id" = "auth"."uid"()) AND ("u"."role" = 3))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."users" "u"
  WHERE (("u"."id" = "auth"."uid"()) AND ("u"."role" = 3)))));



CREATE POLICY "Admin can modify role_permissions" ON "public"."role_permissions" USING ((EXISTS ( SELECT 1
   FROM "public"."users" "u"
  WHERE (("u"."id" = "auth"."uid"()) AND ("u"."role" = 3))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."users" "u"
  WHERE (("u"."id" = "auth"."uid"()) AND ("u"."role" = 3)))));



CREATE POLICY "Admin can modify roles" ON "public"."roles" USING ((EXISTS ( SELECT 1
   FROM "public"."users" "u"
  WHERE (("u"."id" = "auth"."uid"()) AND ("u"."role" = 3))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."users" "u"
  WHERE (("u"."id" = "auth"."uid"()) AND ("u"."role" = 3)))));



CREATE POLICY "Admin can modify user_permissions" ON "public"."user_permissions" USING ((EXISTS ( SELECT 1
   FROM "public"."users" "u"
  WHERE (("u"."id" = "auth"."uid"()) AND ("u"."role" = 3))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."users" "u"
  WHERE (("u"."id" = "auth"."uid"()) AND ("u"."role" = 3)))));



CREATE POLICY "Admins can delete categories" ON "public"."categories" FOR DELETE USING ((EXISTS ( SELECT 1
   FROM (("public"."users" "u"
     JOIN "public"."role_permissions" "rp" ON (("rp"."role_id" = "u"."role")))
     JOIN "public"."permissions" "p" ON (("p"."id" = "rp"."permission_id")))
  WHERE (("u"."id" = "auth"."uid"()) AND ("p"."key" = 'delete:category'::"text")))));



CREATE POLICY "Admins can insert categories" ON "public"."categories" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM (("public"."users" "u"
     JOIN "public"."role_permissions" "rp" ON (("rp"."role_id" = "u"."role")))
     JOIN "public"."permissions" "p" ON (("p"."id" = "rp"."permission_id")))
  WHERE (("u"."id" = "auth"."uid"()) AND ("p"."key" = 'create:category'::"text")))));



CREATE POLICY "Admins can update categories" ON "public"."categories" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM (("public"."users" "u"
     JOIN "public"."role_permissions" "rp" ON (("rp"."role_id" = "u"."role")))
     JOIN "public"."permissions" "p" ON (("p"."id" = "rp"."permission_id")))
  WHERE (("u"."id" = "auth"."uid"()) AND ("p"."key" = 'update:category'::"text")))));



CREATE POLICY "Allow delete for admin only" ON "public"."customers" FOR DELETE USING ((("auth"."role"() = 'admin'::"text") OR (("current_setting"('request.jwt.claims.role'::"text", true))::integer = 3)));



CREATE POLICY "Allow insert" ON "public"."customers" FOR INSERT WITH CHECK (true);



CREATE POLICY "Allow select" ON "public"."customers" FOR SELECT USING (true);



CREATE POLICY "Allow update" ON "public"."customers" FOR UPDATE USING (true) WITH CHECK (true);



CREATE POLICY "Anyone can select categories" ON "public"."categories" FOR SELECT USING (true);



CREATE POLICY "Anyone can view profiles" ON "public"."users" FOR SELECT USING (true);



CREATE POLICY "Brand CRUD permission" ON "public"."brands" USING ((EXISTS ( SELECT 1
   FROM "public"."get_user_permissions"("auth"."uid"()) "get_user_permissions"("role_id", "role_name", "permission_key")
  WHERE ("get_user_permissions"."permission_key" = ANY (ARRAY['create:brand'::"text", 'update:brand'::"text", 'delete:brand'::"text"])))));



CREATE POLICY "Enable insert for authenticated users only" ON "public"."product_categories" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Enable insert for authenticated users only" ON "public"."users" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "FRP" ON "public"."frp" USING (true);



CREATE POLICY "Public can read categories" ON "public"."product_categories" FOR SELECT USING (true);



CREATE POLICY "QUOTE" ON "public"."quotes" USING (true);



CREATE POLICY "Repair" ON "public"."repair" FOR SELECT USING (true);



CREATE POLICY "Seller can insert only their own transactions" ON "public"."transactions" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."users" "u"
  WHERE (("u"."auth_id" = "auth"."uid"()) AND ("u"."id" = "transactions"."sellerID")))));



CREATE POLICY "Seller can update only their own transactions" ON "public"."transactions" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."users" "u"
  WHERE (("u"."auth_id" = "auth"."uid"()) AND ("u"."id" = "transactions"."sellerID"))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."users" "u"
  WHERE (("u"."auth_id" = "auth"."uid"()) AND ("u"."id" = "transactions"."sellerID")))));



CREATE POLICY "Seller can view their own transactions" ON "public"."transactions" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."users" "u"
  WHERE (("u"."auth_id" = "auth"."uid"()) AND ("u"."id" = "transactions"."sellerID")))));



CREATE POLICY "Sellers can insert order products for their own orders" ON "public"."order_products" FOR INSERT TO "authenticated" WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."orders" "o"
  WHERE (("o"."id" = "order_products"."order_id") AND ("o"."sellerID" = "auth"."uid"())))));



CREATE POLICY "Sellers can insert their own orders" ON "public"."orders" FOR INSERT TO "authenticated" WITH CHECK (("sellerID" = "auth"."uid"()));



CREATE POLICY "Sellers can update order products for their own orders" ON "public"."order_products" FOR UPDATE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."orders" "o"
  WHERE (("o"."id" = "order_products"."order_id") AND ("o"."sellerID" = "auth"."uid"()))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."orders" "o"
  WHERE (("o"."id" = "order_products"."order_id") AND ("o"."sellerID" = "auth"."uid"())))));



CREATE POLICY "Sellers can update their own orders" ON "public"."orders" FOR UPDATE TO "authenticated" USING (("sellerID" = "auth"."uid"())) WITH CHECK (("sellerID" = "auth"."uid"()));



CREATE POLICY "Sellers can view their order products" ON "public"."order_products" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."orders" "o"
  WHERE (("o"."id" = "order_products"."order_id") AND ("o"."sellerID" = "auth"."uid"())))));



CREATE POLICY "Sellers can view their own balances" ON "public"."user_balance" FOR SELECT USING (("auth"."uid"() = "sellerID"));



CREATE POLICY "Sellers can view their own orders" ON "public"."orders" FOR SELECT TO "authenticated" USING (("sellerID" = "auth"."uid"()));



CREATE POLICY "Sellers cannot delete orders" ON "public"."orders" FOR DELETE TO "authenticated" USING (false);



CREATE POLICY "Service role and triggers can insert/update balances" ON "public"."user_balance" USING (true) WITH CHECK (true);



CREATE POLICY "User can view transactions by phone number" ON "public"."transactions" FOR SELECT USING (("userPhone" = "current_setting"('app.current_user_phone'::"text", true)));



CREATE POLICY "Users can delete own login sessions" ON "public"."user_login_sessions" FOR DELETE USING ((EXISTS ( SELECT 1
   FROM "public"."users" "u"
  WHERE (("u"."id" = "user_login_sessions"."user_id") AND ("u"."auth_id" = "auth"."uid"())))));



CREATE POLICY "Users can insert own login sessions" ON "public"."user_login_sessions" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."users" "u"
  WHERE (("u"."id" = "user_login_sessions"."user_id") AND ("u"."auth_id" = "auth"."uid"())))));



CREATE POLICY "Users can update own login sessions" ON "public"."user_login_sessions" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."users" "u"
  WHERE (("u"."id" = "user_login_sessions"."user_id") AND ("u"."auth_id" = "auth"."uid"())))));



CREATE POLICY "Users can update their own data" ON "public"."users" FOR UPDATE USING ((("auth"."uid"() = "auth_id") OR ("auth_id" IS NULL)));



CREATE POLICY "Users can view own login sessions" ON "public"."user_login_sessions" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."users" "u"
  WHERE (("u"."id" = "user_login_sessions"."user_id") AND ("u"."auth_id" = "auth"."uid"())))));



CREATE POLICY "Users can view their own data" ON "public"."users" FOR SELECT USING ((("auth"."uid"() = "auth_id") OR ("auth_id" IS NULL)));



ALTER TABLE "public"."brands" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."categories" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."customers" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."frp" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."order_products" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."orders" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."permissions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."product" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."product_categories" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."product_variants" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "public can select brands" ON "public"."brands" FOR SELECT USING (true);



ALTER TABLE "public"."quotes" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."repair" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."role_permissions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."roles" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "roles_admin_delete" ON "public"."roles" FOR DELETE USING ((EXISTS ( SELECT 1
   FROM "public"."users" "u"
  WHERE (("u"."id" = "auth"."uid"()) AND ("u"."role" = 3)))));



CREATE POLICY "roles_admin_insert" ON "public"."roles" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."users" "u"
  WHERE (("u"."id" = "auth"."uid"()) AND ("u"."role" = 3)))));



CREATE POLICY "roles_admin_update" ON "public"."roles" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."users" "u"
  WHERE (("u"."id" = "auth"."uid"()) AND ("u"."role" = 3))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."users" "u"
  WHERE (("u"."id" = "auth"."uid"()) AND ("u"."role" = 3)))));



CREATE POLICY "roles_select_all" ON "public"."roles" FOR SELECT USING (true);



CREATE POLICY "seller_can_manage_products" ON "public"."product" USING (("auth"."uid"() = "seller_id")) WITH CHECK (("auth"."uid"() = "seller_id"));



CREATE POLICY "seller_can_manage_variants" ON "public"."product_variants" USING ((EXISTS ( SELECT 1
   FROM "public"."product" "p"
  WHERE (("p"."id" = "product_variants"."product_id") AND ("p"."seller_id" = "auth"."uid"()))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."product" "p"
  WHERE (("p"."id" = "product_variants"."product_id") AND ("p"."seller_id" = "auth"."uid"())))));



ALTER TABLE "public"."transactions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_balance" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_login_sessions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_permissions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."users" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";






ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."customers";



ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."frp";



ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."order_products";



ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."orders";



ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."quotes";



ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."repair";



ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."roles";



ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."transactions";



ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."user_balance";



ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."users";






GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";



GRANT ALL ON FUNCTION "public"."gtrgm_in"("cstring") TO "postgres";
GRANT ALL ON FUNCTION "public"."gtrgm_in"("cstring") TO "anon";
GRANT ALL ON FUNCTION "public"."gtrgm_in"("cstring") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gtrgm_in"("cstring") TO "service_role";



GRANT ALL ON FUNCTION "public"."gtrgm_out"("public"."gtrgm") TO "postgres";
GRANT ALL ON FUNCTION "public"."gtrgm_out"("public"."gtrgm") TO "anon";
GRANT ALL ON FUNCTION "public"."gtrgm_out"("public"."gtrgm") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gtrgm_out"("public"."gtrgm") TO "service_role";

























































































































































































































































































































































GRANT ALL ON FUNCTION "public"."@user"("username" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."@user"("username" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."@user"("username" "text") TO "service_role";



REVOKE ALL ON FUNCTION "public"."add_transaction_secure"("p_user_phone" "text", "p_amount" numeric, "p_type" "text", "p_mode" "text", "p_notes" "text") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."add_transaction_secure"("p_user_phone" "text", "p_amount" numeric, "p_type" "text", "p_mode" "text", "p_notes" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."add_transaction_secure"("p_user_phone" "text", "p_amount" numeric, "p_type" "text", "p_mode" "text", "p_notes" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."add_transaction_secure"("p_user_phone" "text", "p_amount" numeric, "p_type" "text", "p_mode" "text", "p_notes" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."addproduct"("payload" "jsonb") TO "anon";
GRANT ALL ON FUNCTION "public"."addproduct"("payload" "jsonb") TO "authenticated";
GRANT ALL ON FUNCTION "public"."addproduct"("payload" "jsonb") TO "service_role";



GRANT ALL ON FUNCTION "public"."balance"() TO "anon";
GRANT ALL ON FUNCTION "public"."balance"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."balance"() TO "service_role";



GRANT ALL ON FUNCTION "public"."can"("p_username" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."can"("p_username" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."can"("p_username" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."can"("p_permissions" "text"[], "p_username" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."can"("p_permissions" "text"[], "p_username" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."can"("p_permissions" "text"[], "p_username" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."checkauth"("p_permissions" "text"[]) TO "anon";
GRANT ALL ON FUNCTION "public"."checkauth"("p_permissions" "text"[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."checkauth"("p_permissions" "text"[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."cleanup_empty_categories"() TO "anon";
GRANT ALL ON FUNCTION "public"."cleanup_empty_categories"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."cleanup_empty_categories"() TO "service_role";



GRANT ALL ON FUNCTION "public"."cleanup_trashed_content"() TO "anon";
GRANT ALL ON FUNCTION "public"."cleanup_trashed_content"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."cleanup_trashed_content"() TO "service_role";



GRANT ALL ON TABLE "public"."brands" TO "anon";
GRANT ALL ON TABLE "public"."brands" TO "authenticated";
GRANT ALL ON TABLE "public"."brands" TO "service_role";



GRANT ALL ON FUNCTION "public"."create_brand"("p_name" "text", "p_keywords" "text"[], "p_description" "text", "p_image" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."create_brand"("p_name" "text", "p_keywords" "text"[], "p_description" "text", "p_image" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_brand"("p_name" "text", "p_keywords" "text"[], "p_description" "text", "p_image" "text") TO "service_role";



GRANT ALL ON TABLE "public"."categories" TO "anon";
GRANT ALL ON TABLE "public"."categories" TO "authenticated";
GRANT ALL ON TABLE "public"."categories" TO "service_role";



GRANT ALL ON FUNCTION "public"."create_category"("p_name" "text", "p_keywords" "text"[], "p_description" "text", "p_image" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."create_category"("p_name" "text", "p_keywords" "text"[], "p_description" "text", "p_image" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_category"("p_name" "text", "p_keywords" "text"[], "p_description" "text", "p_image" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."create_order_with_products"("_user_name" "text", "_user_phone" "text", "_user_address" "jsonb", "_seller_id" "uuid", "_seller_name" "text", "_seller_username" "text", "_seller_phone" "text", "_seller_gstin" "text", "_seller_address" "jsonb", "_paid" numeric, "_total_amount" numeric, "_items" "jsonb") TO "anon";
GRANT ALL ON FUNCTION "public"."create_order_with_products"("_user_name" "text", "_user_phone" "text", "_user_address" "jsonb", "_seller_id" "uuid", "_seller_name" "text", "_seller_username" "text", "_seller_phone" "text", "_seller_gstin" "text", "_seller_address" "jsonb", "_paid" numeric, "_total_amount" numeric, "_items" "jsonb") TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_order_with_products"("_user_name" "text", "_user_phone" "text", "_user_address" "jsonb", "_seller_id" "uuid", "_seller_name" "text", "_seller_username" "text", "_seller_phone" "text", "_seller_gstin" "text", "_seller_address" "jsonb", "_paid" numeric, "_total_amount" numeric, "_items" "jsonb") TO "service_role";



GRANT ALL ON FUNCTION "public"."create_transaction_after_order_insert"() TO "anon";
GRANT ALL ON FUNCTION "public"."create_transaction_after_order_insert"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_transaction_after_order_insert"() TO "service_role";



GRANT ALL ON FUNCTION "public"."create_transaction_on_full_refund"() TO "anon";
GRANT ALL ON FUNCTION "public"."create_transaction_on_full_refund"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_transaction_on_full_refund"() TO "service_role";



GRANT ALL ON FUNCTION "public"."create_transaction_on_paid_update"() TO "anon";
GRANT ALL ON FUNCTION "public"."create_transaction_on_paid_update"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_transaction_on_paid_update"() TO "service_role";



GRANT ALL ON FUNCTION "public"."create_transaction_on_product_return"() TO "anon";
GRANT ALL ON FUNCTION "public"."create_transaction_on_product_return"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_transaction_on_product_return"() TO "service_role";



GRANT ALL ON FUNCTION "public"."create_transaction_on_refund"() TO "anon";
GRANT ALL ON FUNCTION "public"."create_transaction_on_refund"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_transaction_on_refund"() TO "service_role";



GRANT ALL ON FUNCTION "public"."delete_brand"("p_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."delete_brand"("p_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."delete_brand"("p_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."delete_category"("p_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."delete_category"("p_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."delete_category"("p_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."ensure_product_category_exists"() TO "anon";
GRANT ALL ON FUNCTION "public"."ensure_product_category_exists"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."ensure_product_category_exists"() TO "service_role";



GRANT ALL ON FUNCTION "public"."fn_create_transaction_after_order_insert"() TO "anon";
GRANT ALL ON FUNCTION "public"."fn_create_transaction_after_order_insert"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."fn_create_transaction_after_order_insert"() TO "service_role";



GRANT ALL ON FUNCTION "public"."fn_create_transaction_on_full_refund"() TO "anon";
GRANT ALL ON FUNCTION "public"."fn_create_transaction_on_full_refund"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."fn_create_transaction_on_full_refund"() TO "service_role";



GRANT ALL ON FUNCTION "public"."fn_create_transaction_on_paid_update"() TO "anon";
GRANT ALL ON FUNCTION "public"."fn_create_transaction_on_paid_update"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."fn_create_transaction_on_paid_update"() TO "service_role";



GRANT ALL ON FUNCTION "public"."fn_create_transaction_on_product_return"() TO "anon";
GRANT ALL ON FUNCTION "public"."fn_create_transaction_on_product_return"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."fn_create_transaction_on_product_return"() TO "service_role";



GRANT ALL ON FUNCTION "public"."fn_handle_product_return_safe"() TO "anon";
GRANT ALL ON FUNCTION "public"."fn_handle_product_return_safe"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."fn_handle_product_return_safe"() TO "service_role";



GRANT ALL ON FUNCTION "public"."fn_reduce_product_variant_quantity"() TO "anon";
GRANT ALL ON FUNCTION "public"."fn_reduce_product_variant_quantity"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."fn_reduce_product_variant_quantity"() TO "service_role";



GRANT ALL ON FUNCTION "public"."fn_reduce_variant_qty_after_insert"() TO "anon";
GRANT ALL ON FUNCTION "public"."fn_reduce_variant_qty_after_insert"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."fn_reduce_variant_qty_after_insert"() TO "service_role";



GRANT ALL ON FUNCTION "public"."fn_update_product_variants_jsonb"() TO "anon";
GRANT ALL ON FUNCTION "public"."fn_update_product_variants_jsonb"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."fn_update_product_variants_jsonb"() TO "service_role";



GRANT ALL ON FUNCTION "public"."generate_content_slug"() TO "anon";
GRANT ALL ON FUNCTION "public"."generate_content_slug"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."generate_content_slug"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_brands"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_brands"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_brands"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_categories"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_categories"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_categories"() TO "service_role";



GRANT ALL ON TABLE "public"."users" TO "anon";
GRANT ALL ON TABLE "public"."users" TO "authenticated";
GRANT ALL ON TABLE "public"."users" TO "service_role";



GRANT ALL ON FUNCTION "public"."get_current_user_details"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_current_user_details"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_current_user_details"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_order_details"("p_order_id" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."get_order_details"("p_order_id" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_order_details"("p_order_id" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_role_with_permissions"("role_id" bigint) TO "anon";
GRANT ALL ON FUNCTION "public"."get_role_with_permissions"("role_id" bigint) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_role_with_permissions"("role_id" bigint) TO "service_role";



GRANT ALL ON FUNCTION "public"."get_seller_balance"("p_seller_id" "uuid", "p_user_phone" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."get_seller_balance"("p_seller_id" "uuid", "p_user_phone" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_seller_balance"("p_seller_id" "uuid", "p_user_phone" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_user_balance"("p_seller_id" "uuid", "p_user_phone" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."get_user_balance"("p_seller_id" "uuid", "p_user_phone" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_user_balance"("p_seller_id" "uuid", "p_user_phone" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_user_balance"("p_seller_id" "uuid", "p_user_phone" "text", "p_is_seller" boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."get_user_balance"("p_seller_id" "uuid", "p_user_phone" "text", "p_is_seller" boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_user_balance"("p_seller_id" "uuid", "p_user_phone" "text", "p_is_seller" boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."get_user_permissions"("user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_user_permissions"("user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_user_permissions"("user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_user_transactions"("p_seller_id" "uuid", "p_user_phone" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."get_user_transactions"("p_seller_id" "uuid", "p_user_phone" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_user_transactions"("p_seller_id" "uuid", "p_user_phone" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."gin_extract_query_trgm"("text", "internal", smallint, "internal", "internal", "internal", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gin_extract_query_trgm"("text", "internal", smallint, "internal", "internal", "internal", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gin_extract_query_trgm"("text", "internal", smallint, "internal", "internal", "internal", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gin_extract_query_trgm"("text", "internal", smallint, "internal", "internal", "internal", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gin_extract_value_trgm"("text", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gin_extract_value_trgm"("text", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gin_extract_value_trgm"("text", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gin_extract_value_trgm"("text", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gin_trgm_consistent"("internal", smallint, "text", integer, "internal", "internal", "internal", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gin_trgm_consistent"("internal", smallint, "text", integer, "internal", "internal", "internal", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gin_trgm_consistent"("internal", smallint, "text", integer, "internal", "internal", "internal", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gin_trgm_consistent"("internal", smallint, "text", integer, "internal", "internal", "internal", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gin_trgm_triconsistent"("internal", smallint, "text", integer, "internal", "internal", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gin_trgm_triconsistent"("internal", smallint, "text", integer, "internal", "internal", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gin_trgm_triconsistent"("internal", smallint, "text", integer, "internal", "internal", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gin_trgm_triconsistent"("internal", smallint, "text", integer, "internal", "internal", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gtrgm_compress"("internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gtrgm_compress"("internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gtrgm_compress"("internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gtrgm_compress"("internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gtrgm_consistent"("internal", "text", smallint, "oid", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gtrgm_consistent"("internal", "text", smallint, "oid", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gtrgm_consistent"("internal", "text", smallint, "oid", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gtrgm_consistent"("internal", "text", smallint, "oid", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gtrgm_decompress"("internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gtrgm_decompress"("internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gtrgm_decompress"("internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gtrgm_decompress"("internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gtrgm_distance"("internal", "text", smallint, "oid", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gtrgm_distance"("internal", "text", smallint, "oid", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gtrgm_distance"("internal", "text", smallint, "oid", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gtrgm_distance"("internal", "text", smallint, "oid", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gtrgm_options"("internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gtrgm_options"("internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gtrgm_options"("internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gtrgm_options"("internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gtrgm_penalty"("internal", "internal", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gtrgm_penalty"("internal", "internal", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gtrgm_penalty"("internal", "internal", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gtrgm_penalty"("internal", "internal", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gtrgm_picksplit"("internal", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gtrgm_picksplit"("internal", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gtrgm_picksplit"("internal", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gtrgm_picksplit"("internal", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gtrgm_same"("public"."gtrgm", "public"."gtrgm", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gtrgm_same"("public"."gtrgm", "public"."gtrgm", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gtrgm_same"("public"."gtrgm", "public"."gtrgm", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gtrgm_same"("public"."gtrgm", "public"."gtrgm", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gtrgm_union"("internal", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gtrgm_union"("internal", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gtrgm_union"("internal", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gtrgm_union"("internal", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_order_refund"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_order_refund"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_order_refund"() TO "service_role";



GRANT ALL ON FUNCTION "public"."insert_category"("_name" "text", "_keywords" "text"[], "_description" "text", "_image" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."insert_category"("_name" "text", "_keywords" "text"[], "_description" "text", "_image" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."insert_category"("_name" "text", "_keywords" "text"[], "_description" "text", "_image" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."is_username_available"("username_input" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."is_username_available"("username_input" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_username_available"("username_input" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."my_transaction"() TO "anon";
GRANT ALL ON FUNCTION "public"."my_transaction"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."my_transaction"() TO "service_role";



GRANT ALL ON FUNCTION "public"."my_transaction"("query" "text", "page" integer, "page_limit" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."my_transaction"("query" "text", "page" integer, "page_limit" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."my_transaction"("query" "text", "page" integer, "page_limit" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."my_transactions"("u_id" "uuid", "page" integer, "page_limit" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."my_transactions"("u_id" "uuid", "page" integer, "page_limit" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."my_transactions"("u_id" "uuid", "page" integer, "page_limit" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."myorders"("query" "text", "page" integer, "page_limit" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."myorders"("query" "text", "page" integer, "page_limit" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."myorders"("query" "text", "page" integer, "page_limit" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."on_product_delete"() TO "anon";
GRANT ALL ON FUNCTION "public"."on_product_delete"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."on_product_delete"() TO "service_role";



GRANT ALL ON FUNCTION "public"."on_variant_change"() TO "anon";
GRANT ALL ON FUNCTION "public"."on_variant_change"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."on_variant_change"() TO "service_role";



GRANT ALL ON FUNCTION "public"."ordershare"("p_share" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."ordershare"("p_share" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."ordershare"("p_share" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."posproduct"("search" "text", "category" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."posproduct"("search" "text", "category" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."posproduct"("search" "text", "category" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."process_return"("p_order_id" "text", "p_items" "jsonb", "p_reason" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."process_return"("p_order_id" "text", "p_items" "jsonb", "p_reason" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."process_return"("p_order_id" "text", "p_items" "jsonb", "p_reason" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."process_return"("p_order_id" "text", "p_return_type" "text", "p_items" "jsonb", "p_reason" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."process_return"("p_order_id" "text", "p_return_type" "text", "p_items" "jsonb", "p_reason" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."process_return"("p_order_id" "text", "p_return_type" "text", "p_items" "jsonb", "p_reason" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."process_return"("p_order_id" "uuid", "p_return_type" "text", "p_items" "jsonb", "p_reason" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."process_return"("p_order_id" "uuid", "p_return_type" "text", "p_items" "jsonb", "p_reason" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."process_return"("p_order_id" "uuid", "p_return_type" "text", "p_items" "jsonb", "p_reason" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."product_generate_slug"() TO "anon";
GRANT ALL ON FUNCTION "public"."product_generate_slug"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."product_generate_slug"() TO "service_role";



GRANT ALL ON FUNCTION "public"."product_insert_category"() TO "anon";
GRANT ALL ON FUNCTION "public"."product_insert_category"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."product_insert_category"() TO "service_role";



GRANT ALL ON FUNCTION "public"."purge_deleted_products"() TO "anon";
GRANT ALL ON FUNCTION "public"."purge_deleted_products"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."purge_deleted_products"() TO "service_role";



GRANT ALL ON FUNCTION "public"."reduce_product_and_variant_quantity"() TO "anon";
GRANT ALL ON FUNCTION "public"."reduce_product_and_variant_quantity"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."reduce_product_and_variant_quantity"() TO "service_role";



GRANT ALL ON FUNCTION "public"."reduce_product_variant_quantity"() TO "anon";
GRANT ALL ON FUNCTION "public"."reduce_product_variant_quantity"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."reduce_product_variant_quantity"() TO "service_role";



GRANT ALL ON FUNCTION "public"."restock_full_order"("orderid" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."restock_full_order"("orderid" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."restock_full_order"("orderid" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."restock_product_variant"() TO "anon";
GRANT ALL ON FUNCTION "public"."restock_product_variant"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."restock_product_variant"() TO "service_role";



GRANT ALL ON FUNCTION "public"."restock_product_variant_on_partial_return"() TO "anon";
GRANT ALL ON FUNCTION "public"."restock_product_variant_on_partial_return"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."restock_product_variant_on_partial_return"() TO "service_role";



GRANT ALL ON FUNCTION "public"."restore_product"("pid" bigint) TO "anon";
GRANT ALL ON FUNCTION "public"."restore_product"("pid" bigint) TO "authenticated";
GRANT ALL ON FUNCTION "public"."restore_product"("pid" bigint) TO "service_role";



GRANT ALL ON FUNCTION "public"."seller_balance"() TO "anon";
GRANT ALL ON FUNCTION "public"."seller_balance"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."seller_balance"() TO "service_role";



GRANT ALL ON FUNCTION "public"."seller_recent_orders"("p_username" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."seller_recent_orders"("p_username" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."seller_recent_orders"("p_username" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."seller_stock"("stock_filter" "text", "category_filter" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."seller_stock"("stock_filter" "text", "category_filter" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."seller_stock"("stock_filter" "text", "category_filter" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."seller_stock_rows"("stock_filter" "text", "category_filter" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."seller_stock_rows"("stock_filter" "text", "category_filter" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."seller_stock_rows"("stock_filter" "text", "category_filter" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."seller_stocks"("stock_filter" "text", "category_filter" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."seller_stocks"("stock_filter" "text", "category_filter" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."seller_stocks"("stock_filter" "text", "category_filter" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."seller_top"("p_username" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."seller_top"("p_username" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."seller_top"("p_username" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."seller_transactions_list"() TO "anon";
GRANT ALL ON FUNCTION "public"."seller_transactions_list"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."seller_transactions_list"() TO "service_role";



GRANT ALL ON FUNCTION "public"."seller_transactions_list"("filter" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."seller_transactions_list"("filter" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."seller_transactions_list"("filter" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."sellerorders"("query" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."sellerorders"("query" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."sellerorders"("query" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."session"() TO "anon";
GRANT ALL ON FUNCTION "public"."session"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."session"() TO "service_role";



GRANT ALL ON FUNCTION "public"."session"("user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."session"("user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."session"("user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."set_limit"(real) TO "postgres";
GRANT ALL ON FUNCTION "public"."set_limit"(real) TO "anon";
GRANT ALL ON FUNCTION "public"."set_limit"(real) TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_limit"(real) TO "service_role";



GRANT ALL ON FUNCTION "public"."set_orders_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."set_orders_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_orders_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."set_show_whatsapp_by_role"() TO "anon";
GRANT ALL ON FUNCTION "public"."set_show_whatsapp_by_role"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_show_whatsapp_by_role"() TO "service_role";



GRANT ALL ON FUNCTION "public"."set_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."set_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."set_user_balance_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."set_user_balance_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_user_balance_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."show_limit"() TO "postgres";
GRANT ALL ON FUNCTION "public"."show_limit"() TO "anon";
GRANT ALL ON FUNCTION "public"."show_limit"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."show_limit"() TO "service_role";



GRANT ALL ON FUNCTION "public"."show_trgm"("text") TO "postgres";
GRANT ALL ON FUNCTION "public"."show_trgm"("text") TO "anon";
GRANT ALL ON FUNCTION "public"."show_trgm"("text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."show_trgm"("text") TO "service_role";



GRANT ALL ON FUNCTION "public"."similarity"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."similarity"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."similarity"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."similarity"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."similarity_dist"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."similarity_dist"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."similarity_dist"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."similarity_dist"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."similarity_op"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."similarity_op"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."similarity_op"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."similarity_op"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."sitemap_users"() TO "anon";
GRANT ALL ON FUNCTION "public"."sitemap_users"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."sitemap_users"() TO "service_role";



GRANT ALL ON FUNCTION "public"."soft_delete_product"("pid" bigint) TO "anon";
GRANT ALL ON FUNCTION "public"."soft_delete_product"("pid" bigint) TO "authenticated";
GRANT ALL ON FUNCTION "public"."soft_delete_product"("pid" bigint) TO "service_role";



GRANT ALL ON FUNCTION "public"."strict_word_similarity"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."strict_word_similarity"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."strict_word_similarity"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."strict_word_similarity"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."strict_word_similarity_commutator_op"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_commutator_op"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_commutator_op"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_commutator_op"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."strict_word_similarity_dist_commutator_op"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_dist_commutator_op"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_dist_commutator_op"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_dist_commutator_op"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."strict_word_similarity_dist_op"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_dist_op"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_dist_op"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_dist_op"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."strict_word_similarity_op"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_op"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_op"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_op"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."sync_variants_cache"() TO "anon";
GRANT ALL ON FUNCTION "public"."sync_variants_cache"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."sync_variants_cache"() TO "service_role";



GRANT ALL ON FUNCTION "public"."trg_create_transactions_after_order_insert"() TO "anon";
GRANT ALL ON FUNCTION "public"."trg_create_transactions_after_order_insert"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."trg_create_transactions_after_order_insert"() TO "service_role";



GRANT ALL ON FUNCTION "public"."trg_financial_engine"() TO "anon";
GRANT ALL ON FUNCTION "public"."trg_financial_engine"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."trg_financial_engine"() TO "service_role";



GRANT ALL ON FUNCTION "public"."trg_order_full_refund_atomic"() TO "anon";
GRANT ALL ON FUNCTION "public"."trg_order_full_refund_atomic"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."trg_order_full_refund_atomic"() TO "service_role";



GRANT ALL ON FUNCTION "public"."trg_product_return_atomic"() TO "anon";
GRANT ALL ON FUNCTION "public"."trg_product_return_atomic"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."trg_product_return_atomic"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_brand"("p_id" "uuid", "p_name" "text", "p_keywords" "text"[], "p_description" "text", "p_image" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."update_brand"("p_id" "uuid", "p_name" "text", "p_keywords" "text"[], "p_description" "text", "p_image" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_brand"("p_id" "uuid", "p_name" "text", "p_keywords" "text"[], "p_description" "text", "p_image" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."update_categories"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_categories"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_categories"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_category"("p_id" "uuid", "p_name" "text", "p_keywords" "text"[], "p_description" "text", "p_image" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."update_category"("p_id" "uuid", "p_name" "text", "p_keywords" "text"[], "p_description" "text", "p_image" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_category"("p_id" "uuid", "p_name" "text", "p_keywords" "text"[], "p_description" "text", "p_image" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."update_content_comment_count"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_content_comment_count"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_content_comment_count"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_content_counters"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_content_counters"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_content_counters"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_content_engagement"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_content_engagement"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_content_engagement"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_product_query"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_product_query"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_product_query"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_product_variants_jsonb"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_product_variants_jsonb"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_product_variants_jsonb"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_tag_usage_count"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_tag_usage_count"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_tag_usage_count"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_user_balance"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_user_balance"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_user_balance"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_variants_cache"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_variants_cache"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_variants_cache"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_variants_cache_from_product"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_variants_cache_from_product"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_variants_cache_from_product"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_variants_cache_from_variant_safe"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_variants_cache_from_variant_safe"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_variants_cache_from_variant_safe"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_variants_from_product_safe"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_variants_from_product_safe"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_variants_from_product_safe"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_variants_from_variant"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_variants_from_variant"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_variants_from_variant"() TO "service_role";



GRANT ALL ON FUNCTION "public"."updateproduct"("payload" "jsonb") TO "anon";
GRANT ALL ON FUNCTION "public"."updateproduct"("payload" "jsonb") TO "authenticated";
GRANT ALL ON FUNCTION "public"."updateproduct"("payload" "jsonb") TO "service_role";



GRANT ALL ON FUNCTION "public"."user"("username" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."user"("username" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."user"("username" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."user_profile"("username" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."user_profile"("username" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."user_profile"("username" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."usercategories"("username" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."usercategories"("username" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."usercategories"("username" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."userproducts"("username" "text", "search" "text", "category" "text", "page" integer, "limit_count" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."userproducts"("username" "text", "search" "text", "category" "text", "page" integer, "limit_count" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."userproducts"("username" "text", "search" "text", "category" "text", "page" integer, "limit_count" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."word_similarity"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."word_similarity"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."word_similarity"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."word_similarity"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."word_similarity_commutator_op"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."word_similarity_commutator_op"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."word_similarity_commutator_op"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."word_similarity_commutator_op"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."word_similarity_dist_commutator_op"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."word_similarity_dist_commutator_op"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."word_similarity_dist_commutator_op"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."word_similarity_dist_commutator_op"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."word_similarity_dist_op"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."word_similarity_dist_op"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."word_similarity_dist_op"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."word_similarity_dist_op"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."word_similarity_op"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."word_similarity_op"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."word_similarity_op"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."word_similarity_op"("text", "text") TO "service_role";

































GRANT ALL ON TABLE "public"."customers" TO "anon";
GRANT ALL ON TABLE "public"."customers" TO "authenticated";
GRANT ALL ON TABLE "public"."customers" TO "service_role";



GRANT ALL ON SEQUENCE "public"."customers_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."customers_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."customers_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."frp" TO "anon";
GRANT ALL ON TABLE "public"."frp" TO "authenticated";
GRANT ALL ON TABLE "public"."frp" TO "service_role";



GRANT ALL ON SEQUENCE "public"."frp_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."frp_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."frp_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."notifications" TO "anon";
GRANT ALL ON TABLE "public"."notifications" TO "authenticated";
GRANT ALL ON TABLE "public"."notifications" TO "service_role";



GRANT ALL ON SEQUENCE "public"."notifications_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."notifications_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."notifications_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."order_products" TO "anon";
GRANT ALL ON TABLE "public"."order_products" TO "authenticated";
GRANT ALL ON TABLE "public"."order_products" TO "service_role";



GRANT ALL ON SEQUENCE "public"."order_products_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."order_products_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."order_products_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."orders" TO "anon";
GRANT ALL ON TABLE "public"."orders" TO "authenticated";
GRANT ALL ON TABLE "public"."orders" TO "service_role";



GRANT ALL ON TABLE "public"."permissions" TO "anon";
GRANT ALL ON TABLE "public"."permissions" TO "authenticated";
GRANT ALL ON TABLE "public"."permissions" TO "service_role";



GRANT ALL ON SEQUENCE "public"."permissions_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."permissions_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."permissions_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."product" TO "anon";
GRANT ALL ON TABLE "public"."product" TO "authenticated";
GRANT ALL ON TABLE "public"."product" TO "service_role";



GRANT ALL ON TABLE "public"."product_categories" TO "anon";
GRANT ALL ON TABLE "public"."product_categories" TO "authenticated";
GRANT ALL ON TABLE "public"."product_categories" TO "service_role";



GRANT ALL ON TABLE "public"."product_variants" TO "anon";
GRANT ALL ON TABLE "public"."product_variants" TO "authenticated";
GRANT ALL ON TABLE "public"."product_variants" TO "service_role";



GRANT ALL ON TABLE "public"."quotes" TO "anon";
GRANT ALL ON TABLE "public"."quotes" TO "authenticated";
GRANT ALL ON TABLE "public"."quotes" TO "service_role";



GRANT ALL ON SEQUENCE "public"."quotes_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."quotes_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."quotes_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."repair" TO "anon";
GRANT ALL ON TABLE "public"."repair" TO "authenticated";
GRANT ALL ON TABLE "public"."repair" TO "service_role";



GRANT ALL ON SEQUENCE "public"."repair_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."repair_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."repair_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."role_permissions" TO "anon";
GRANT ALL ON TABLE "public"."role_permissions" TO "authenticated";
GRANT ALL ON TABLE "public"."role_permissions" TO "service_role";



GRANT ALL ON TABLE "public"."roles" TO "anon";
GRANT ALL ON TABLE "public"."roles" TO "authenticated";
GRANT ALL ON TABLE "public"."roles" TO "service_role";



GRANT ALL ON SEQUENCE "public"."roles_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."roles_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."roles_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."team_members" TO "anon";
GRANT ALL ON TABLE "public"."team_members" TO "authenticated";
GRANT ALL ON TABLE "public"."team_members" TO "service_role";



GRANT ALL ON SEQUENCE "public"."team_members_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."team_members_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."team_members_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."teams" TO "anon";
GRANT ALL ON TABLE "public"."teams" TO "authenticated";
GRANT ALL ON TABLE "public"."teams" TO "service_role";



GRANT ALL ON SEQUENCE "public"."teams_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."teams_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."teams_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."transactions" TO "anon";
GRANT ALL ON TABLE "public"."transactions" TO "authenticated";
GRANT ALL ON TABLE "public"."transactions" TO "service_role";



GRANT ALL ON TABLE "public"."user_balance" TO "anon";
GRANT ALL ON TABLE "public"."user_balance" TO "authenticated";
GRANT ALL ON TABLE "public"."user_balance" TO "service_role";



GRANT ALL ON TABLE "public"."user_login_sessions" TO "anon";
GRANT ALL ON TABLE "public"."user_login_sessions" TO "authenticated";
GRANT ALL ON TABLE "public"."user_login_sessions" TO "service_role";



GRANT ALL ON TABLE "public"."user_permissions" TO "anon";
GRANT ALL ON TABLE "public"."user_permissions" TO "authenticated";
GRANT ALL ON TABLE "public"."user_permissions" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "service_role";
























