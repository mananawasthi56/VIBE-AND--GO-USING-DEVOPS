import nodemailer from 'nodemailer'

const otpStore = new Map()

export async function POST(req) {
  try {
    const { email } = await req.json()

    if (!email) {
      return Response.json({ error: 'Email is required' }, { status: 400 })
    }

    // Generate 6 digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString()

    // Store OTP with expiry (5 minutes)
    otpStore.set(email, {
      otp,
      expiry: Date.now() + 5 * 60 * 1000,
    })

    // Send email
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT),
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    })

    await transporter.sendMail({
      from: `"Vibe & Go" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: '🎯 Your Vibe & Go OTP Code',
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; background: #0a0a0a; color: #fff; border-radius: 20px; overflow: hidden;">
          <div style="background: linear-gradient(135deg, #22c55e, #16a34a); padding: 32px; text-align: center;">
            <h1 style="margin: 0; font-size: 28px;">Vibe & Go 🗺️</h1>
            <p style="margin: 8px 0 0; opacity: 0.9;">Find your perfect vibe</p>
          </div>
          <div style="padding: 32px; text-align: center;">
            <p style="color: #9ca3af; margin-bottom: 24px;">Your verification code is:</p>
            <div style="background: #1a1a1a; border: 2px solid #22c55e; border-radius: 16px; padding: 24px; display: inline-block;">
              <span style="font-size: 42px; font-weight: 700; letter-spacing: 12px; color: #22c55e;">${otp}</span>
            </div>
            <p style="color: #6b7280; font-size: 13px; margin-top: 24px;">
              This code expires in <strong style="color: #fff;">5 minutes</strong>
            </p>
            <p style="color: #4b5563; font-size: 12px; margin-top: 8px;">
              If you didn't request this, ignore this email.
            </p>
          </div>
        </div>
      `,
    })

    return Response.json({ success: true, message: 'OTP sent successfully!' })
  } catch (err) {
    console.error('OTP error:', err)
    return Response.json({ error: 'Failed to send OTP' }, { status: 500 })
  }
}

export async function PUT(req) {
  try {
    const { email, otp } = await req.json()

    const stored = otpStore.get(email)

    if (!stored) {
      return Response.json({ error: 'OTP not found. Please request again.' }, { status: 400 })
    }

    if (Date.now() > stored.expiry) {
      otpStore.delete(email)
      return Response.json({ error: 'OTP expired. Please request again.' }, { status: 400 })
    }

    if (stored.otp !== otp) {
      return Response.json({ error: 'Invalid OTP. Please try again.' }, { status: 400 })
    }

    otpStore.delete(email)
    return Response.json({ success: true, message: 'OTP verified successfully!' })
  } catch (err) {
    return Response.json({ error: 'Verification failed' }, { status: 500 })
  }
}