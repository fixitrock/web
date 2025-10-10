

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


CREATE SCHEMA IF NOT EXISTS "public";


ALTER SCHEMA "public" OWNER TO "pg_database_owner";


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE TYPE "public"."Roles" AS ENUM (
    'admin',
    'user',
    'shopkeeper'
);


ALTER TYPE "public"."Roles" OWNER TO "postgres";


COMMENT ON TYPE "public"."Roles" IS 'Roles';



CREATE OR REPLACE FUNCTION "public"."cleanup_deleted_products"() RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
begin
  delete from public.product_variants
  where deleted_at is not null
  and deleted_at < now() - interval '7 days';

  delete from public.product
  where deleted_at is not null
  and deleted_at < now() - interval '7 days';
end;
$$;


ALTER FUNCTION "public"."cleanup_deleted_products"() OWNER TO "postgres";


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


CREATE OR REPLACE FUNCTION "public"."get_user_permissions"("user_id" "uuid") RETURNS TABLE("role_id" bigint, "role_name" "text", "permission_key" "text")
    LANGUAGE "sql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  with role_perms as (
    select
      u.role as role_id,
      r.role as role_name,
      p.id as permission_id,
      p.key as permission_key
    from public.users u
    join public.roles r on r.id = u.role
    join public.role_permissions rp on rp.role_id = r.id
    join public.permissions p on p.id = rp.permission_id
    where u.id = user_id
  ),
  user_overrides as (
    select
      up.user_id,
      up.permission_id,
      p.key as permission_key,
      up.is_granted
    from public.user_permissions up
    join public.permissions p on p.id = up.permission_id
    where up.user_id = user_id
  )
  select
    rp.role_id,
    rp.role_name,
    rp.permission_key
  from role_perms rp
  where not exists (
    select 1
    from user_overrides uo
    where uo.permission_id = rp.permission_id and uo.is_granted = false
  )
  union
  select
    (select role from public.users where id = user_id),
    (select role from public.roles where id = (select role from public.users where id = user_id)),
    uo.permission_key
  from user_overrides uo
  where uo.is_granted = true;
$$;


ALTER FUNCTION "public"."get_user_permissions"("user_id" "uuid") OWNER TO "postgres";


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


CREATE OR REPLACE FUNCTION "public"."set_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
begin
  new.updated_at = now();
  return new;
end;
$$;


ALTER FUNCTION "public"."set_updated_at"() OWNER TO "postgres";


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

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."access_token" (
    "id" bigint NOT NULL,
    "token" "text" NOT NULL,
    "expires_at" timestamp with time zone NOT NULL
);


ALTER TABLE "public"."access_token" OWNER TO "postgres";


ALTER TABLE "public"."access_token" ALTER COLUMN "id" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME "public"."access_token_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."api_credentials" (
    "client_id" "text",
    "client_secret" "text",
    "refresh_token" "text",
    "id" bigint NOT NULL
);


ALTER TABLE "public"."api_credentials" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."api_credentials_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "public"."api_credentials_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."api_credentials_id_seq" OWNED BY "public"."api_credentials"."id";



CREATE TABLE IF NOT EXISTS "public"."brands" (
    "id" integer NOT NULL,
    "name" character varying(255) NOT NULL,
    "description" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "logo" "jsonb",
    "img" character varying(255),
    "keyword" character varying(255)
);


ALTER TABLE "public"."brands" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."categories_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "public"."categories_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."categories_id_seq" OWNED BY "public"."brands"."id";



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
    "id" bigint NOT NULL,
    "user_id" "uuid" NOT NULL,
    "slug" "text" NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "compatible" "text",
    "category" "text",
    "brand" "text",
    "img" "jsonb" DEFAULT '[]'::"jsonb" NOT NULL,
    "purchase" numeric(10,2) NOT NULL,
    "staff_price" numeric(10,2) NOT NULL,
    "price" numeric(10,2) NOT NULL,
    "mrp" numeric(10,2) NOT NULL,
    "qty" integer DEFAULT 0 NOT NULL,
    "variants_cache" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "deleted_at" timestamp with time zone
);


ALTER TABLE "public"."product" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."product_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "public"."product_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."product_id_seq" OWNED BY "public"."product"."id";



CREATE TABLE IF NOT EXISTS "public"."product_variants" (
    "id" bigint NOT NULL,
    "product_id" bigint NOT NULL,
    "color" "jsonb",
    "size" "text",
    "brand" "text",
    "purchase" numeric(10,2) NOT NULL,
    "staff_price" numeric(10,2) NOT NULL,
    "price" numeric(10,2) NOT NULL,
    "mrp" numeric(10,2) NOT NULL,
    "qty" integer DEFAULT 0 NOT NULL,
    "img" "jsonb" DEFAULT '[]'::"jsonb" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "deleted_at" timestamp with time zone
);


ALTER TABLE "public"."product_variants" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."product_variants_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "public"."product_variants_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."product_variants_id_seq" OWNED BY "public"."product_variants"."id";



CREATE TABLE IF NOT EXISTS "public"."products" (
    "id" integer NOT NULL,
    "user_id" "uuid" NOT NULL,
    "slug" "text" NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "img" "jsonb",
    "purchase" numeric NOT NULL,
    "staff_price" numeric,
    "price" numeric,
    "qty" integer DEFAULT 0 NOT NULL,
    "category" "text",
    "brand" "text",
    "other" "jsonb",
    "deleted_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()),
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()),
    "compatible" "text"
);


ALTER TABLE "public"."products" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."products_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "public"."products_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."products_id_seq" OWNED BY "public"."products"."id";



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



CREATE TABLE IF NOT EXISTS "public"."space_credentials" (
    "id" bigint NOT NULL,
    "client_id" "text" NOT NULL,
    "client_secret" "text" NOT NULL,
    "redirect_uri" "text" NOT NULL,
    "refresh_token" "text",
    "refresh_token_expires_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."space_credentials" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."space_credentials_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "public"."space_credentials_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."space_credentials_id_seq" OWNED BY "public"."space_credentials"."id";



CREATE TABLE IF NOT EXISTS "public"."space_tokens" (
    "id" bigint NOT NULL,
    "credential_id" bigint,
    "access_token" "text" NOT NULL,
    "token_expires_at" timestamp with time zone NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."space_tokens" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."space_tokens_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "public"."space_tokens_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."space_tokens_id_seq" OWNED BY "public"."space_tokens"."id";



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


CREATE TABLE IF NOT EXISTS "public"."users" (
    "id" "uuid" NOT NULL,
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
    "location" "text",
    "location_url" "text",
    "cover" "text",
    "verified" boolean DEFAULT false,
    "last_login_at" timestamp with time zone,
    "last_login_ip" "inet",
    "last_login_device" "text"
);


ALTER TABLE "public"."users" OWNER TO "postgres";


ALTER TABLE ONLY "public"."api_credentials" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."api_credentials_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."brands" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."categories_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."frp" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."frp_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."notifications" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."notifications_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."permissions" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."permissions_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."product" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."product_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."product_variants" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."product_variants_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."products" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."products_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."quotes" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."quotes_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."repair" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."repair_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."space_credentials" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."space_credentials_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."space_tokens" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."space_tokens_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."team_members" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."team_members_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."teams" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."teams_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."access_token"
    ADD CONSTRAINT "access_token_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."api_credentials"
    ADD CONSTRAINT "api_credentials_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."brands"
    ADD CONSTRAINT "categories_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."frp"
    ADD CONSTRAINT "frp_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."permissions"
    ADD CONSTRAINT "permissions_key_key" UNIQUE ("key");



ALTER TABLE ONLY "public"."permissions"
    ADD CONSTRAINT "permissions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."product"
    ADD CONSTRAINT "product_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."product"
    ADD CONSTRAINT "product_slug_key" UNIQUE ("slug");



ALTER TABLE ONLY "public"."product_variants"
    ADD CONSTRAINT "product_variants_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."products"
    ADD CONSTRAINT "products_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."products"
    ADD CONSTRAINT "products_user_id_slug_key" UNIQUE ("user_id", "slug");



ALTER TABLE ONLY "public"."quotes"
    ADD CONSTRAINT "quotes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."repair"
    ADD CONSTRAINT "repair_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."role_permissions"
    ADD CONSTRAINT "role_permissions_pkey" PRIMARY KEY ("role_id", "permission_id");



ALTER TABLE ONLY "public"."roles"
    ADD CONSTRAINT "roles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."space_credentials"
    ADD CONSTRAINT "space_credentials_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."space_tokens"
    ADD CONSTRAINT "space_tokens_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."team_members"
    ADD CONSTRAINT "team_members_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."team_members"
    ADD CONSTRAINT "team_members_team_id_user_id_key" UNIQUE ("team_id", "user_id");



ALTER TABLE ONLY "public"."teams"
    ADD CONSTRAINT "teams_pkey" PRIMARY KEY ("id");



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



CREATE INDEX "idx_space_credentials_client_id" ON "public"."space_credentials" USING "btree" ("client_id");



CREATE INDEX "idx_space_tokens_credential_id" ON "public"."space_tokens" USING "btree" ("credential_id");



CREATE INDEX "idx_space_tokens_expiry" ON "public"."space_tokens" USING "btree" ("token_expires_at");



CREATE INDEX "idx_user_login_sessions_created_at" ON "public"."user_login_sessions" USING "btree" ("created_at");



CREATE INDEX "idx_user_login_sessions_is_active" ON "public"."user_login_sessions" USING "btree" ("is_active");



CREATE INDEX "idx_user_login_sessions_last_activity" ON "public"."user_login_sessions" USING "btree" ("last_activity");



CREATE INDEX "idx_user_login_sessions_session_id" ON "public"."user_login_sessions" USING "btree" ("session_id");



CREATE INDEX "idx_user_login_sessions_user_id" ON "public"."user_login_sessions" USING "btree" ("user_id");



CREATE OR REPLACE TRIGGER "trg_product_updated_at" BEFORE UPDATE ON "public"."product" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "trg_product_variants_updated_at" BEFORE UPDATE ON "public"."product_variants" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "trg_sync_variants_cache" AFTER INSERT OR DELETE OR UPDATE ON "public"."product_variants" FOR EACH ROW EXECUTE FUNCTION "public"."sync_variants_cache"();



ALTER TABLE ONLY "public"."product"
    ADD CONSTRAINT "product_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."product_variants"
    ADD CONSTRAINT "product_variants_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."product"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."products"
    ADD CONSTRAINT "products_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."role_permissions"
    ADD CONSTRAINT "role_permissions_permission_id_fkey" FOREIGN KEY ("permission_id") REFERENCES "public"."permissions"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."role_permissions"
    ADD CONSTRAINT "role_permissions_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."space_tokens"
    ADD CONSTRAINT "space_tokens_credential_id_fkey" FOREIGN KEY ("credential_id") REFERENCES "public"."space_credentials"("id");



ALTER TABLE ONLY "public"."user_login_sessions"
    ADD CONSTRAINT "user_login_sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_permissions"
    ADD CONSTRAINT "user_permissions_permission_id_fkey" FOREIGN KEY ("permission_id") REFERENCES "public"."permissions"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_permissions"
    ADD CONSTRAINT "user_permissions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



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



CREATE POLICY "Allow anyone to view products" ON "public"."products" FOR SELECT USING (true);



CREATE POLICY "Allow authenticated users to insert their own products" ON "public"."products" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Allow product owner to delete" ON "public"."products" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Allow product owner to update" ON "public"."products" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Anyone can view brands" ON "public"."brands" FOR SELECT USING (true);



CREATE POLICY "Anyone can view profiles" ON "public"."users" FOR SELECT USING (true);



CREATE POLICY "Only admin users can delete brands" ON "public"."brands" FOR DELETE USING ((EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."id" = "auth"."uid"()) AND ("users"."role" = 3)))));



CREATE POLICY "Only admin users can insert brands" ON "public"."brands" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."id" = "auth"."uid"()) AND ("users"."role" = 3)))));



CREATE POLICY "Only admin users can update brands" ON "public"."brands" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."id" = "auth"."uid"()) AND ("users"."role" = 3))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."id" = "auth"."uid"()) AND ("users"."role" = 3)))));



CREATE POLICY "Role 3 can delete space credentials" ON "public"."space_credentials" FOR DELETE USING ((EXISTS ( SELECT 1
   FROM "public"."users" "u"
  WHERE (("u"."id" = "auth"."uid"()) AND ("u"."role" = 3)))));



CREATE POLICY "Role 3 can insert space credentials" ON "public"."space_credentials" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."users" "u"
  WHERE (("u"."id" = "auth"."uid"()) AND ("u"."role" = 3)))));



CREATE POLICY "Role 3 can update space credentials" ON "public"."space_credentials" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."users" "u"
  WHERE (("u"."id" = "auth"."uid"()) AND ("u"."role" = 3)))));



CREATE POLICY "Role 3 can view space credentials" ON "public"."space_credentials" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."users" "u"
  WHERE (("u"."id" = "auth"."uid"()) AND ("u"."role" = 3)))));



CREATE POLICY "Users can delete own login sessions" ON "public"."user_login_sessions" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can delete variants for own products" ON "public"."product_variants" FOR DELETE USING ((EXISTS ( SELECT 1
   FROM "public"."product" "p"
  WHERE (("p"."id" = "product_variants"."product_id") AND ("p"."user_id" = "auth"."uid"())))));



CREATE POLICY "Users can insert own login sessions" ON "public"."user_login_sessions" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can insert own products" ON "public"."product" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can insert their own row" ON "public"."users" FOR INSERT WITH CHECK (("auth"."uid"() = "id"));



CREATE POLICY "Users can insert variants for own products" ON "public"."product_variants" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."product" "p"
  WHERE (("p"."id" = "product_variants"."product_id") AND ("p"."user_id" = "auth"."uid"()) AND ("p"."deleted_at" IS NULL)))));



CREATE POLICY "Users can soft delete own products" ON "public"."product" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update own login sessions" ON "public"."user_login_sessions" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update own products" ON "public"."product" FOR UPDATE USING ((("auth"."uid"() = "user_id") AND ("deleted_at" IS NULL))) WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update their own data" ON "public"."users" FOR UPDATE USING (("auth"."uid"() = "id"));



CREATE POLICY "Users can update variants for own products" ON "public"."product_variants" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."product" "p"
  WHERE (("p"."id" = "product_variants"."product_id") AND ("p"."user_id" = "auth"."uid"()) AND ("p"."deleted_at" IS NULL))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."product" "p"
  WHERE (("p"."id" = "product_variants"."product_id") AND ("p"."user_id" = "auth"."uid"()) AND ("p"."deleted_at" IS NULL)))));



CREATE POLICY "Users can view own login sessions" ON "public"."user_login_sessions" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view own non-deleted products" ON "public"."product" FOR SELECT USING ((("auth"."uid"() = "user_id") AND ("deleted_at" IS NULL)));



CREATE POLICY "Users can view their own data" ON "public"."users" FOR SELECT USING (("auth"."uid"() = "id"));



CREATE POLICY "Users can view variants of own products" ON "public"."product_variants" FOR SELECT USING (((EXISTS ( SELECT 1
   FROM "public"."product" "p"
  WHERE (("p"."id" = "product_variants"."product_id") AND ("p"."user_id" = "auth"."uid"()) AND ("p"."deleted_at" IS NULL)))) AND ("deleted_at" IS NULL)));



ALTER TABLE "public"."api_credentials" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "api_credentials_admin_delete" ON "public"."api_credentials" FOR DELETE USING ((EXISTS ( SELECT 1
   FROM "public"."users" "u"
  WHERE (("u"."id" = "auth"."uid"()) AND ("u"."role" = 3)))));



CREATE POLICY "api_credentials_admin_insert" ON "public"."api_credentials" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."users" "u"
  WHERE (("u"."id" = "auth"."uid"()) AND ("u"."role" = 3)))));



CREATE POLICY "api_credentials_admin_update" ON "public"."api_credentials" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."users" "u"
  WHERE (("u"."id" = "auth"."uid"()) AND ("u"."role" = 3))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."users" "u"
  WHERE (("u"."id" = "auth"."uid"()) AND ("u"."role" = 3)))));



CREATE POLICY "api_credentials_select_all" ON "public"."api_credentials" FOR SELECT USING (true);



ALTER TABLE "public"."brands" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."permissions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."product" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."product_variants" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."products" ENABLE ROW LEVEL SECURITY;


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



CREATE POLICY "tokens" ON "public"."space_tokens" USING (true);



ALTER TABLE "public"."user_login_sessions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_permissions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."users" ENABLE ROW LEVEL SECURITY;


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";



GRANT ALL ON FUNCTION "public"."cleanup_deleted_products"() TO "anon";
GRANT ALL ON FUNCTION "public"."cleanup_deleted_products"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."cleanup_deleted_products"() TO "service_role";



GRANT ALL ON FUNCTION "public"."cleanup_trashed_content"() TO "anon";
GRANT ALL ON FUNCTION "public"."cleanup_trashed_content"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."cleanup_trashed_content"() TO "service_role";



GRANT ALL ON FUNCTION "public"."generate_content_slug"() TO "anon";
GRANT ALL ON FUNCTION "public"."generate_content_slug"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."generate_content_slug"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_role_with_permissions"("role_id" bigint) TO "anon";
GRANT ALL ON FUNCTION "public"."get_role_with_permissions"("role_id" bigint) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_role_with_permissions"("role_id" bigint) TO "service_role";



GRANT ALL ON FUNCTION "public"."get_user_permissions"("user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_user_permissions"("user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_user_permissions"("user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."is_username_available"("username_input" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."is_username_available"("username_input" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_username_available"("username_input" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."restore_product"("pid" bigint) TO "anon";
GRANT ALL ON FUNCTION "public"."restore_product"("pid" bigint) TO "authenticated";
GRANT ALL ON FUNCTION "public"."restore_product"("pid" bigint) TO "service_role";



GRANT ALL ON FUNCTION "public"."set_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."set_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."soft_delete_product"("pid" bigint) TO "anon";
GRANT ALL ON FUNCTION "public"."soft_delete_product"("pid" bigint) TO "authenticated";
GRANT ALL ON FUNCTION "public"."soft_delete_product"("pid" bigint) TO "service_role";



GRANT ALL ON FUNCTION "public"."sync_variants_cache"() TO "anon";
GRANT ALL ON FUNCTION "public"."sync_variants_cache"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."sync_variants_cache"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_content_comment_count"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_content_comment_count"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_content_comment_count"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_content_counters"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_content_counters"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_content_counters"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_content_engagement"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_content_engagement"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_content_engagement"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_tag_usage_count"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_tag_usage_count"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_tag_usage_count"() TO "service_role";



GRANT ALL ON TABLE "public"."access_token" TO "anon";
GRANT ALL ON TABLE "public"."access_token" TO "authenticated";
GRANT ALL ON TABLE "public"."access_token" TO "service_role";



GRANT ALL ON SEQUENCE "public"."access_token_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."access_token_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."access_token_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."api_credentials" TO "anon";
GRANT ALL ON TABLE "public"."api_credentials" TO "authenticated";
GRANT ALL ON TABLE "public"."api_credentials" TO "service_role";



GRANT ALL ON SEQUENCE "public"."api_credentials_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."api_credentials_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."api_credentials_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."brands" TO "anon";
GRANT ALL ON TABLE "public"."brands" TO "authenticated";
GRANT ALL ON TABLE "public"."brands" TO "service_role";



GRANT ALL ON SEQUENCE "public"."categories_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."categories_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."categories_id_seq" TO "service_role";



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



GRANT ALL ON TABLE "public"."permissions" TO "anon";
GRANT ALL ON TABLE "public"."permissions" TO "authenticated";
GRANT ALL ON TABLE "public"."permissions" TO "service_role";



GRANT ALL ON SEQUENCE "public"."permissions_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."permissions_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."permissions_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."product" TO "anon";
GRANT ALL ON TABLE "public"."product" TO "authenticated";
GRANT ALL ON TABLE "public"."product" TO "service_role";



GRANT ALL ON SEQUENCE "public"."product_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."product_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."product_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."product_variants" TO "anon";
GRANT ALL ON TABLE "public"."product_variants" TO "authenticated";
GRANT ALL ON TABLE "public"."product_variants" TO "service_role";



GRANT ALL ON SEQUENCE "public"."product_variants_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."product_variants_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."product_variants_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."products" TO "anon";
GRANT ALL ON TABLE "public"."products" TO "authenticated";
GRANT ALL ON TABLE "public"."products" TO "service_role";



GRANT ALL ON SEQUENCE "public"."products_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."products_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."products_id_seq" TO "service_role";



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



GRANT ALL ON TABLE "public"."space_credentials" TO "anon";
GRANT ALL ON TABLE "public"."space_credentials" TO "authenticated";
GRANT ALL ON TABLE "public"."space_credentials" TO "service_role";



GRANT ALL ON SEQUENCE "public"."space_credentials_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."space_credentials_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."space_credentials_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."space_tokens" TO "anon";
GRANT ALL ON TABLE "public"."space_tokens" TO "authenticated";
GRANT ALL ON TABLE "public"."space_tokens" TO "service_role";



GRANT ALL ON SEQUENCE "public"."space_tokens_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."space_tokens_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."space_tokens_id_seq" TO "service_role";



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



GRANT ALL ON TABLE "public"."user_login_sessions" TO "anon";
GRANT ALL ON TABLE "public"."user_login_sessions" TO "authenticated";
GRANT ALL ON TABLE "public"."user_login_sessions" TO "service_role";



GRANT ALL ON TABLE "public"."user_permissions" TO "anon";
GRANT ALL ON TABLE "public"."user_permissions" TO "authenticated";
GRANT ALL ON TABLE "public"."user_permissions" TO "service_role";



GRANT ALL ON TABLE "public"."users" TO "anon";
GRANT ALL ON TABLE "public"."users" TO "authenticated";
GRANT ALL ON TABLE "public"."users" TO "service_role";



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






RESET ALL;
