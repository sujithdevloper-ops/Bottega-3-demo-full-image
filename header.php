<!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
    <meta charset="<?php bloginfo( 'charset' ); ?>">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <!-- Adobe Typekit & Google Fonts for Luxury Ambroise Francois & Maison Neue Extended Typography -->
    <script src="https://use.typekit.net/pig8glj.js"></script>
    <script>try{Typekit.load();}catch(e){}</script>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Alex+Brush&family=Bodoni+Moda:ital,opsz,wght@0,6..96,400..900;1,6..96,400..900&family=Pinyon+Script&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="style.css">
    <link rel="stylesheet" href="assets/css/style.css">
    <?php wp_head(); ?>
</head>
<body <?php body_class(); ?>>
<?php wp_body_open(); ?>

<header class="site-header site-header-transparent">
    <div class="header-inner">
        <!-- Brand -->
        <div class="site-brand">
            <a href="<?php echo esc_url( home_url( '/' ) ); ?>" class="brand-link">
                <svg class="brand-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <polygon points="12 2 22 12 12 22 2 12 12 2"></polygon>
                    <circle cx="12" cy="12" r="3"></circle>
                </svg>
                <span class="brand-name">BOTTEGA</span>
            </a>
        </div>

        <!-- Creative Bottega Logo-Dot Menu Trigger & Popover -->
        <div class="creative-dot-menu-wrap">
            <button id="dotMenuBtn" class="dot-menu-trigger" aria-label="Toggle Navigation">
                <span class="dot-pattern-icon">
                    <span class="dot d1"></span>
                    <span class="dot d2"></span>
                    <span class="dot d3"></span>
                    <span class="dot d4"></span>
                </span>
            </button>

            <!-- Popover Menu Links -->
            <div id="dotMenuPopover" class="dot-menu-popover">
                <nav class="popover-nav">
                    <a href="about.html" class="pop-link">About</a>
                    <a href="projects.html" class="pop-link">Projects</a>
                    <a href="services.html" class="pop-link">Services</a>
                    <a href="contact.html" class="pop-link pop-contact">Contact</a>
                </nav>
            </div>
        </div>
    </div>
</header>
