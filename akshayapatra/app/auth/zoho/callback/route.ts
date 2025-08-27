import { NextRequest, NextResponse } from 'next/server'

/**
 * Zoho OAuth Callback Handler
 * This endpoint handles the OAuth callback from Zoho Desk
 * Used during the initial OAuth setup to exchange authorization codes for tokens
 */

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const error = searchParams.get('error')
    const state = searchParams.get('state')

    console.log('🔄 [ZOHO CALLBACK] OAuth callback received', {
      hasCode: !!code,
      error,
      state
    })

    // Handle OAuth errors
    if (error) {
      console.error('🔄 [ZOHO CALLBACK] OAuth error:', error)
      return NextResponse.redirect(
        new URL(`/admin/support?error=${encodeURIComponent(error)}`, request.url)
      )
    }

    // Validate authorization code
    if (!code) {
      console.warn('🔄 [ZOHO CALLBACK] Missing authorization code')
      return NextResponse.redirect(
        new URL('/admin/support?error=missing_code', request.url)
      )
    }

    // For production use, you would typically:
    // 1. Exchange the authorization code for access and refresh tokens
    // 2. Store the refresh token securely
    // 3. Redirect to a success page

    // Since we're using server-side refresh token approach,
    // this callback is mainly for initial OAuth setup
    console.log('🔄 [ZOHO CALLBACK] Authorization code received successfully')

    // Create a response page showing the authorization code
    // This allows admins to copy the code for manual token exchange
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Zoho OAuth Authorization</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          max-width: 800px;
          margin: 50px auto;
          padding: 20px;
          background: #f5f5f5;
        }
        .container {
          background: white;
          padding: 30px;
          border-radius: 10px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .success {
          color: #28a745;
          border: 2px solid #28a745;
          background: #d4edda;
          padding: 15px;
          border-radius: 5px;
          margin-bottom: 20px;
        }
        .code-box {
          background: #f8f9fa;
          border: 1px solid #dee2e6;
          border-radius: 5px;
          padding: 15px;
          font-family: monospace;
          word-break: break-all;
          margin: 15px 0;
        }
        .copy-btn {
          background: #007bff;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 4px;
          cursor: pointer;
          margin-top: 10px;
        }
        .copy-btn:hover {
          background: #0056b3;
        }
        .next-steps {
          background: #e9ecef;
          padding: 20px;
          border-radius: 5px;
          margin-top: 20px;
        }
        .next-steps h3 {
          margin-top: 0;
          color: #495057;
        }
        .next-steps ol {
          color: #6c757d;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>🎉 Zoho OAuth Authorization Successful</h1>
        
        <div class="success">
          <strong>✓ Authorization Complete</strong><br>
          You have successfully authorized the Akshayapatra application to access your Zoho Desk.
        </div>

        <h2>Authorization Code</h2>
        <p>Use this authorization code to generate your refresh token:</p>
        <div class="code-box" id="auth-code">${code}</div>
        <button class="copy-btn" onclick="copyCode()">📋 Copy Code</button>

        <div class="next-steps">
          <h3>Next Steps:</h3>
          <ol>
            <li>Copy the authorization code above</li>
            <li>Use it to generate a refresh token via the Zoho API</li>
            <li>Add the refresh token to your environment variables</li>
            <li>Test the integration from the admin support page</li>
          </ol>
          
          <h4>API Call to Exchange Code for Token:</h4>
          <div class="code-box">
curl -X POST https://accounts.zoho.in/oauth/v2/token \\
  -d "grant_type=authorization_code" \\
  -d "client_id=YOUR_CLIENT_ID" \\
  -d "client_secret=YOUR_CLIENT_SECRET" \\
  -d "redirect_uri=${new URL('/auth/zoho/callback', request.url).href}" \\
  -d "code=${code}"
          </div>
        </div>

        <p style="margin-top: 30px;">
          <a href="/admin/support" style="color: #007bff; text-decoration: none;">
            ← Return to Admin Support Dashboard
          </a>
        </p>
      </div>

      <script>
        function copyCode() {
          const codeElement = document.getElementById('auth-code');
          const textArea = document.createElement('textarea');
          textArea.value = codeElement.textContent;
          document.body.appendChild(textArea);
          textArea.select();
          document.execCommand('copy');
          document.body.removeChild(textArea);
          
          const btn = event.target;
          const originalText = btn.textContent;
          btn.textContent = '✓ Copied!';
          btn.style.background = '#28a745';
          setTimeout(() => {
            btn.textContent = originalText;
            btn.style.background = '#007bff';
          }, 2000);
        }
      </script>
    </body>
    </html>
    `

    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html',
      },
    })

  } catch (error) {
    console.error('🔄 [ZOHO CALLBACK] Unexpected error:', error)
    return NextResponse.redirect(
      new URL('/admin/support?error=callback_error', request.url)
    )
  }
}

// Handle POST requests (some OAuth providers send POST callbacks)
export async function POST(request: NextRequest) {
  console.log('🔄 [ZOHO CALLBACK] POST callback received (redirecting to GET handler)')
  
  // Parse form data and redirect to GET with query parameters
  try {
    const formData = await request.formData()
    const code = formData.get('code')
    const error = formData.get('error')
    const state = formData.get('state')

    const params = new URLSearchParams()
    if (code) params.set('code', code.toString())
    if (error) params.set('error', error.toString())
    if (state) params.set('state', state.toString())

    return NextResponse.redirect(
      new URL(`/auth/zoho/callback?${params.toString()}`, request.url)
    )
  } catch (error) {
    console.error('🔄 [ZOHO CALLBACK] POST parsing error:', error)
    return NextResponse.redirect(
      new URL('/admin/support?error=post_callback_error', request.url)
    )
  }
}
