import React from 'react'

export default function Page() {
    return (
        <main className='mx-auto max-w-4xl space-y-8 p-6'>
            <h1 className='mb-4 text-3xl font-bold'>Terms & Conditions</h1>

            {/* Introduction */}
            <section>
                <h2 className='mb-2 text-xl font-semibold'>Introduction</h2>
                <p>
                    Welcome to Fix it Rock! By accessing or using our website, you agree to these
                    Terms & Conditions. Please read them carefully before using our services.
                </p>
            </section>

            {/* Company Details */}
            <section>
                <h2 className='mb-2 text-xl font-semibold'>Company Details</h2>
                <p>
                    <strong>Company Name:</strong> Fix it Rock
                    <br />
                    <strong>Website:</strong> https://fixitrock.com
                    <br />
                    <strong>Support:</strong>{' '}
                    <a
                        className='text-blue-600 underline'
                        href='https://wa.me/919999999999'
                        rel='noopener noreferrer'
                        target='_blank'
                    >
                        WhatsApp
                    </a>
                    <br />
                    <strong>Address:</strong> Sikandarabad, Bulandshahr
                    <br />
                </p>
            </section>

            {/* User Data & Privacy */}
            <section>
                <h2 className='mb-2 text-xl font-semibold'>User Data & Privacy</h2>
                <p>
                    We respect your privacy. We do not store your email or any personal information
                    unless absolutely necessary for the functioning of our services. We do not sell,
                    share, or transmit your personal data to any third parties or to the internet.
                    However, users may choose to share their own data or content at their
                    discretion. For more details, please read our Privacy Policy.
                </p>
            </section>

            {/* Cookies */}
            <section>
                <h2 className='mb-2 text-xl font-semibold'>Cookies</h2>
                <p>
                    We use cookies solely for essential website functionality, such as maintaining
                    your login session and improving your experience. We do not use cookies for
                    advertising or tracking purposes. No cookie data is shared with third parties.
                </p>
            </section>

            {/* General Terms */}
            <section>
                <h2 className='mb-2 text-xl font-semibold'>General Terms</h2>
                <ul className='list-disc space-y-2 pl-6'>
                    <li>
                        You must use this website in accordance with all applicable laws and
                        regulations.
                    </li>
                    <li>
                        We may update these terms at any time. Continued use of the website means
                        you accept the changes.
                    </li>
                    <li>
                        We are not liable for any damages resulting from the use of this website.
                    </li>
                </ul>
            </section>

            {/* Contact */}
            <section>
                <h2 className='mb-2 text-xl font-semibold'>Contact Us</h2>
                <p>
                    If you have any questions about these Terms & Conditions, please contact us via{' '}
                    <a
                        className='text-blue-600 underline'
                        href='https://wa.me/919999999999'
                        rel='noopener noreferrer'
                        target='_blank'
                    >
                        WhatsApp
                    </a>
                    .
                </p>
            </section>
        </main>
    )
}
