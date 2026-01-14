# Fixing "Not Found" Errors in Production

This file provides instructions on how to fix the "Not Found" error that occurs when reloading pages in the production environment. This is a common issue with Single-Page Applications (SPAs) like yours.

The problem is that the production server doesn't know how to handle client-side routes. When you refresh a page, the browser sends a request to the server for that specific URL (e.g., `/book-driver`). If the server isn't configured to always serve your application's main `index.html` file, it will return a 404 "Not Found" error.

Your project is configured to deploy to **Render**, **AWS S3**, or **Azure Static Web Apps**. Please follow the instructions for the service you are using to deploy your application.

---

## 1. Render

If you are deploying to Render, you need to add a rewrite rule to your static site.

1.  Go to your service's **Settings** page on the Render dashboard.
2.  In the "Redirects and Rewrites" section, add a new **Rewrite Rule**.
3.  Set the following values:
    *   **Source:** `/*`
    *   **Destination:** `/index.html`

This will ensure that all requests are redirected to your `index.html` file, allowing React Router to handle the routing.

---

## 2. AWS S3

If you are using AWS S3 for static hosting, you need to configure the S3 bucket's error document.

1.  Open the AWS Management Console and navigate to the **S3** service.
2.  Select your bucket.
3.  Click on the **Properties** tab.
4.  Scroll down to **Static website hosting** and click **Edit**.
5.  Set the **Error document** to `index.html`.

This configuration tells S3 to serve `index.html` whenever a requested object is not found, which effectively solves the refresh problem.

---

## 3. Azure Static Web Apps

For Azure Static Web Apps, you can solve this by adding a `staticwebapp.config.json` file to your project.

1.  Create a new file named `staticwebapp.config.json` in the root of your `DHAPP-FRONTEND` directory.
2.  Add the following content to the file:

    ```json
    {
      "navigationFallback": {
        "rewrite": "/index.html"
      }
    }
    ```

When you deploy your application, Azure Static Web Apps will automatically use this configuration to handle client-side routing correctly.
