"""
Universal Icon and Logo Generator for ATKIN
Replaces all desktop, mobile (Android/iOS), web, and UI logo assets
with the official ATKIN Advocate illustration.
"""

import os
import glob
from PIL import Image, ImageDraw

SOURCE_IMAGE = r"C:\Users\lalwa\.gemini\antigravity\brain\afbc6a72-d96d-4b13-a68e-fe693ed2a863\.user_uploaded\media_1790434816974.png"
ROOT_DIR = r"C:\Users\lalwa\.gemini\antigravity\scratch\proofline"

def create_circular_badge(src_im, size=1024, border_color=(226, 232, 240, 255), border_width=8, bg_color=(255, 255, 255, 255)):
    """Creates a high-contrast circular badge suitable for app icons and dark/light taskbars."""
    badge = Image.new("RGBA", (size, size), (255, 255, 255, 0))
    draw = ImageDraw.Draw(badge)
    
    pad = int(size * 0.03)
    draw.ellipse((pad, pad, size - pad, size - pad), fill=bg_color, outline=border_color, width=border_width)
    
    # Scale figure to sit comfortably within the circle
    inner_dim = int(size * 0.84)
    scaled_fig = src_im.resize((inner_dim, inner_dim), Image.Resampling.LANCZOS)
    
    offset_x = (size - inner_dim) // 2
    offset_y = int(size * 0.10)
    badge.paste(scaled_fig, (offset_x, offset_y), scaled_fig)
    return badge

def create_square_app_icon(src_im, size=1024, bg_color=(255, 255, 255, 255)):
    """Creates an opaque square app icon (e.g. for iOS / Apple Touch)."""
    icon = Image.new("RGBA", (size, size), bg_color)
    inner_dim = int(size * 0.88)
    scaled_fig = src_im.resize((inner_dim, inner_dim), Image.Resampling.LANCZOS)
    offset_x = (size - inner_dim) // 2
    offset_y = int(size * 0.08)
    icon.paste(scaled_fig, (offset_x, offset_y), scaled_fig)
    return icon

def main():
    print(f"Loading source image from: {SOURCE_IMAGE}")
    src_im = Image.open(SOURCE_IMAGE).convert("RGBA")
    
    # 1. Prepare directories
    public_dir = os.path.join(ROOT_DIR, "public")
    assets_dir = os.path.join(ROOT_DIR, "src", "assets")
    os.makedirs(public_dir, exist_ok=True)
    os.makedirs(assets_dir, exist_ok=True)
    
    badge_1024 = create_circular_badge(src_im, 1024)
    square_1024 = create_square_app_icon(src_im, 1024)
    
    # 2. Save Web & Frontend Assets
    print("Writing Web & Frontend public assets...")
    # Raw transparent logo
    src_im.save(os.path.join(public_dir, "atkin-logo.png"), "PNG")
    src_im.save(os.path.join(assets_dir, "atkin-logo.png"), "PNG")
    badge_1024.save(os.path.join(public_dir, "atkin-logo-badge.png"), "PNG")
    badge_1024.save(os.path.join(assets_dir, "atkin-logo-badge.png"), "PNG")
    
    # Favicons
    badge_32 = badge_1024.resize((32, 32), Image.Resampling.LANCZOS)
    badge_32.save(os.path.join(public_dir, "favicon.png"), "PNG")
    badge_16 = badge_1024.resize((16, 16), Image.Resampling.LANCZOS)
    badge_16.save(os.path.join(public_dir, "favicon-16x16.png"), "PNG")
    
    # Apple Touch Icon (180x180 opaque)
    apple_icon = square_1024.resize((180, 180), Image.Resampling.LANCZOS).convert("RGB")
    apple_icon.save(os.path.join(public_dir, "apple-touch-icon.png"), "PNG")
    
    # Multi-res favicon.ico
    ico_sizes = [(16, 16), (24, 24), (32, 32), (48, 48), (64, 64), (128, 128), (256, 256)]
    ico_images = [badge_1024.resize(sz, Image.Resampling.LANCZOS) for sz in ico_sizes]
    ico_images[0].save(
        os.path.join(public_dir, "favicon.ico"),
        format="ICO",
        sizes=ico_sizes,
        append_images=ico_images[1:]
    )
    print("[OK] public/favicon.ico and web assets created")

    # 3. Save Tauri Desktop Icons (src-tauri/icons)
    print("Writing Tauri Desktop icons...")
    tauri_icons_dir = os.path.join(ROOT_DIR, "src-tauri", "icons")
    os.makedirs(tauri_icons_dir, exist_ok=True)
    
    # Primary desktop icon.png & icon.ico
    badge_512 = badge_1024.resize((512, 512), Image.Resampling.LANCZOS)
    badge_512.save(os.path.join(tauri_icons_dir, "icon.png"), "PNG")
    
    # Multi-resolution icon.ico for Windows
    ico_images[0].save(
        os.path.join(tauri_icons_dir, "icon.ico"),
        format="ICO",
        sizes=ico_sizes,
        append_images=ico_images[1:]
    )
    
    # Also update in target resource if present
    target_res_ico = os.path.join(ROOT_DIR, "src-tauri", "target", "release", "resources", "icon.ico")
    if os.path.exists(os.path.dirname(target_res_ico)):
        ico_images[0].save(target_res_ico, format="ICO", sizes=ico_sizes, append_images=ico_images[1:])
        print("[OK] Updated target/release/resources/icon.ico")

    # Standard png sizes
    standard_sizes = {
        "32x32.png": (32, 32),
        "64x64.png": (64, 64),
        "128x128.png": (128, 128),
        "128x128@2x.png": (256, 256),
        "Square30x30Logo.png": (30, 30),
        "Square44x44Logo.png": (44, 44),
        "Square71x71Logo.png": (71, 71),
        "Square89x89Logo.png": (89, 89),
        "Square107x107Logo.png": (107, 107),
        "Square142x142Logo.png": (142, 142),
        "Square150x150Logo.png": (150, 150),
        "Square284x284Logo.png": (284, 284),
        "Square310x310Logo.png": (310, 310),
        "StoreLogo.png": (50, 50),
    }
    for filename, sz in standard_sizes.items():
        resized = badge_1024.resize(sz, Image.Resampling.LANCZOS)
        resized.save(os.path.join(tauri_icons_dir, filename), "PNG")
    print("[OK] All standard Tauri desktop PNG and ICO icons created")

    # 4. Save iOS App Icons (src-tauri/icons/ios)
    print("Writing iOS App Icons...")
    ios_icons_dir = os.path.join(tauri_icons_dir, "ios")
    if os.path.exists(ios_icons_dir):
        ios_files = glob.glob(os.path.join(ios_icons_dir, "*.png"))
        for ios_file in ios_files:
            orig = Image.open(ios_file)
            w, h = orig.size
            # iOS requires RGB with no alpha
            scaled_ios = square_1024.resize((w, h), Image.Resampling.LANCZOS).convert("RGB")
            scaled_ios.save(ios_file, "PNG")
        print(f"[OK] Updated {len(ios_files)} iOS icons in {ios_icons_dir}")

    # 5. Save Android Icons (src-tauri/gen/android/app/src/main/res)
    print("Writing Android Mipmap Icons...")
    android_res_dir = os.path.join(ROOT_DIR, "src-tauri", "gen", "android", "app", "src", "main", "res")
    if os.path.exists(android_res_dir):
        density_configs = {
            "mipmap-mdpi": {"legacy": (48, 48), "foreground": (108, 108)},
            "mipmap-hdpi": {"legacy": (72, 72), "foreground": (162, 162)},
            "mipmap-xhdpi": {"legacy": (96, 96), "foreground": (216, 216)},
            "mipmap-xxhdpi": {"legacy": (144, 144), "foreground": (324, 324)},
            "mipmap-xxxhdpi": {"legacy": (192, 192), "foreground": (432, 432)}
        }
        for density, cfg in density_configs.items():
            folder = os.path.join(android_res_dir, density)
            if not os.path.exists(folder):
                continue
            
            leg_w, leg_h = cfg["legacy"]
            fg_w, fg_h = cfg["foreground"]
            
            # ic_launcher.png (badge/rounded)
            ic_launcher = badge_1024.resize((leg_w, leg_h), Image.Resampling.LANCZOS)
            ic_launcher.save(os.path.join(folder, "ic_launcher.png"), "PNG")
            
            # ic_launcher_round.png
            ic_launcher.save(os.path.join(folder, "ic_launcher_round.png"), "PNG")
            
            # ic_launcher_foreground.png: adaptive icon foreground (central 66% safe area)
            fg = Image.new("RGBA", (fg_w, fg_h), (0, 0, 0, 0))
            inner_fg_dim = int(fg_w * 0.66)
            scaled_fig = src_im.resize((inner_fg_dim, inner_fg_dim), Image.Resampling.LANCZOS)
            fg_x = (fg_w - inner_fg_dim) // 2
            fg_y = int(fg_h * 0.18)
            fg.paste(scaled_fig, (fg_x, fg_y), scaled_fig)
            fg.save(os.path.join(folder, "ic_launcher_foreground.png"), "PNG")
            
        print("[OK] All Android mipmap densities updated")

    print("\nUniversal ATKIN logo generation completed successfully!")

if __name__ == "__main__":
    main()
