# Wedding Save the Date Animation

A lightweight, high-performance static web page with a top-down driving car animation and foliage sway for a wedding "Save the Date" announcement. Designed to look stunning on mobile (WhatsApp & Instagram previews) and desktop browsers.

## Project Structure

```text
├── index.html           # Main page with layout, animation logic, and editable text
├── assets/
│   ├── bg.jpg           # Road & foliage background image
│   └── car.png          # Transparent top-down classic convertible car image
├── .github/workflows/
│   └── deploy.yml       # Automated GitHub Pages deployment workflow
├── .nojekyll            # Prevents Jekyll processing on GitHub Pages
└── README.md
```

## How to Customize Text

Open [index.html](index.html) and locate the lines marked `EDIT HERE`:

1. **Initial text** (disappears as the car drives over it):
   ```html
   <!-- EDIT HERE: first text (disappears under the car) -->
   <div class="L o" style="top:35%"><span class="t sc" style="font-size:calc(var(--rw)*.27)">Save the</span></div>
   <div class="L o" style="top:44%"><span class="t sc" style="font-size:calc(var(--rw)*.36)">Date</span></div>
   ```

2. **Celebration text** (fades in sequentially after the car covers the first text):
   ```html
   <!-- EDIT HERE: second text (fades in after the car has covered the first) -->
   <div class="L n" style="top:29%"><span class="t sf" style="font-size:calc(var(--rw)*.30);font-weight:600">Nov 19</span></div>
   <div class="L n" style="top:36%"><span class="t sf" style="font-size:calc(var(--rw)*.095);letter-spacing:.32em">2026</span></div>
   <div class="L n" style="top:44%"><span class="t sf" style="font-size:calc(var(--rw)*.088);font-style:italic">For the wedding celebration of</span></div>
   <div class="L n" style="top:52%"><span class="t sc" style="font-size:calc(var(--rw)*.24)">Groom</span></div>
   <div class="L n" style="top:58%"><span class="t sf" style="font-size:calc(var(--rw)*.13)">&amp;</span></div>
   <div class="L n" style="top:64.5%"><span class="t sc" style="font-size:calc(var(--rw)*.24)">Bride</span></div>
   ```

3. **Page Title and Social Sharing Metadata**:
   In the `<head>` of [index.html](index.html), customize the `<title>`, `<meta name="description">`, `og:title`, and `og:description` with the couple's names and date.

## Local Preview

You can run a local web server using Python:

```bash
python -m http.server 8000
```

Then open `http://localhost:8000` in your web browser.

## How to Deploy to GitHub Pages (When Ready)

1. Initialize git (if not already done) and commit the files:
   ```bash
   git init
   git add .
   git commit -m "Initial commit of Save the Date page"
   ```
2. Create a new repository on GitHub (e.g., `save-the-date`) and push your code:
   ```bash
   git branch -M main
   git remote add origin https://github.com/<your-username>/<your-repo-name>.git
   git push -u origin main
   ```
3. In your GitHub repository:
   - Go to **Settings** > **Pages**.
   - Under **Build and deployment** > **Source**, choose **GitHub Actions** (the `.github/workflows/deploy.yml` workflow will automatically run and publish your site).
   - Once completed, your shareable public URL will be `https://<your-username>.github.io/<your-repo-name>/`.
