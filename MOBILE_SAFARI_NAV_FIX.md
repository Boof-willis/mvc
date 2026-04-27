# Mobile Safari Fixed Navbar Fix

Use this pattern when iOS Safari shows page content "bleeding" above a sticky header while scrolling, especially near the status bar/address bar area.

## The Problem

On iOS Safari, `position: sticky` can leave a visible transparent gap above the navbar while browser chrome expands/collapses. If `viewport-fit=cover` is enabled, Safari may also allow page content to render into the safe-area/status-bar region.

The symptom looks like page content sliding behind or above the navbar instead of the area staying solid like an extension of the nav.

## The Fix

On mobile, use a fixed navbar instead of sticky, force it into its own compositor layer, and add top padding to the `body` so content starts below the fixed nav.

### Viewport Meta

Do not use `viewport-fit=cover` unless you are intentionally managing safe areas yourself.

```html
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="theme-color" content="#0A0A0A">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black">
```

### Desktop / Default Navbar

```css
header.nav{
  border-bottom:1px solid var(--ink);
  background:var(--paper);
  position:sticky;
  top:0;
  z-index:100;
}
```

### Mobile Safari Override

Adjust `73px` to match the rendered height of your mobile navbar.

```css
@media(max-width:520px){
  header.nav{
    position:fixed;
    left:0;
    right:0;
    top:0;
    z-index:9999;
    -webkit-transform:translate3d(0,0,0);
    transform:translate3d(0,0,0);
    -webkit-backface-visibility:hidden;
    backface-visibility:hidden;
  }

  body{
    padding-top:73px;
  }
}
```

## Why This Works

- `position:fixed` keeps the nav painted at the viewport top while Safari chrome changes.
- `translate3d(0,0,0)` promotes the nav to a stable compositor layer.
- `backface-visibility:hidden` reduces Safari repaint artifacts.
- `body` top padding prevents content from sliding under the fixed nav.
- Removing `viewport-fit=cover` prevents Safari from exposing unmanaged safe-area content above the page.

## Checklist

- Keep the navbar background solid.
- Do not use a negative `z-index` pseudo-element for the safe area.
- Avoid `viewport-fit=cover` unless you also handle `env(safe-area-inset-top)`.
- Test on a real iPhone in Safari, not only Chrome desktop emulation.
- If the nav height changes at mobile breakpoints, update the `body` padding to match.
