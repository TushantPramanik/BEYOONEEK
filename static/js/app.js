/**
 * BEYOONEEK OTT PLATFORM - CLIENT APPLICATION SCRIPT
 * High-Performance, Next-Generation Cinematic Web App
 */

class BeyooneekApp {
    constructor() {
        // App State
        this.currentUser = null;
        this.movies = [];
        this.heroMovies = [];
        this.currentHeroIndex = 0;
        this.heroTimer = null;
        this.watchlist = new Set();
        this.continueHistory = [];
        this.plans = [];
        
        // Video Player State
        this.activeMovie = null;
        this.videoEl = null;
        this.progressTimer = null;
        this.adTimer = null;
        this.isAdActive = false;
        this.selectedQuality = "4K Ultra HD";
        this.selectedSpeed = 1.0;
        
        // Checkout State
        this.selectedUpgradePlan = "Platinum Plan";
        this.selectedUpgradePrice = 20.0;
        this.currentPaymentMethod = "Credit Card";
        
        // Audio Context for subtle futuristic SFX
        this.audioCtx = null;

        // Bind DOM elements
        this.initElements();
    }

    initElements() {
        this.videoEl = document.getElementById("cinemaVideo");
    }

    async init() {
        console.log("Initializing BEYOONEEK OTT Platform...");
        this.initAudioContext();
        this.initScrollListener();
        this.initVideoEventListeners();
        this.initGlobalListeners();
        
        // Load User Session (Default to VIP Demo User for instant delight if none)
        this.loadSession();

        // Load Plans from API (B_account_type.py)
        await this.loadPlans();

        // Load Catalog Data (D_trending.py & E_explore.py)
        await Promise.all([
            this.loadHeroMovies(),
            this.loadTrendingMovies(),
            this.loadExploreMovies(),
            this.loadUserHistory(),
            this.loadUserWatchlist()
        ]);

        this.renderAuthMenuActions();
        this.startHeroCarousel();
    }

    // ================= SFX AUDIO SYSTEM (Web Audio API) =================
    initAudioContext() {
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (AudioContext) {
                this.audioCtx = new AudioContext();
            }
        } catch (e) {
            console.warn("Web Audio not supported", e);
        }
    }

    playUiSound(type = "click") {
        if (!this.audioCtx) return;
        if (this.audioCtx.state === "suspended") {
            this.audioCtx.resume();
        }
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        osc.connect(gain);
        gain.connect(this.audioCtx.destination);

        const now = this.audioCtx.currentTime;

        if (type === "click") {
            osc.type = "sine";
            osc.frequency.setValueAtTime(600, now);
            osc.frequency.exponentialRampToValueAtTime(1200, now + 0.06);
            gain.gain.setValueAtTime(0.04, now);
            gain.gain.linearRampToValueAtTime(0.001, now + 0.06);
            osc.start(now);
            osc.stop(now + 0.06);
        } else if (type === "success") {
            osc.type = "triangle";
            osc.frequency.setValueAtTime(523.25, now); // C5
            osc.frequency.setValueAtTime(659.25, now + 0.1); // E5
            osc.frequency.setValueAtTime(783.99, now + 0.2); // G5
            osc.frequency.setValueAtTime(1046.50, now + 0.3); // C6
            gain.gain.setValueAtTime(0.06, now);
            gain.gain.linearRampToValueAtTime(0.001, now + 0.5);
            osc.start(now);
            osc.stop(now + 0.5);
        }
    }

    // ================= SCROLL & NAVBAR DYNAMICS =================
    initScrollListener() {
        const navbar = document.getElementById("navbar");
        window.addEventListener("scroll", () => {
            if (window.scrollY > 50) {
                navbar.classList.add("scrolled");
            } else {
                navbar.classList.remove("scrolled");
            }
        });
    }

    initGlobalListeners() {
        // Close dropdowns on outside click
        window.addEventListener("click", (e) => {
            const userPill = document.getElementById("userProfileWrapper");
            if (userPill && !userPill.contains(e.target)) {
                const menu = document.getElementById("userDropdownMenu");
                if (menu) menu.classList.remove("active");
            }

            // Player popover menus
            const speedWrapper = document.querySelector("#speedMenu")?.parentElement;
            const qualityWrapper = document.querySelector("#qualityMenu")?.parentElement;
            const audioWrapper = document.querySelector("#audioMenu")?.parentElement;

            if (speedWrapper && !speedWrapper.contains(e.target)) {
                document.getElementById("speedMenu")?.classList.remove("active");
            }
            if (qualityWrapper && !qualityWrapper.contains(e.target)) {
                document.getElementById("qualityMenu")?.classList.remove("active");
            }
            if (audioWrapper && !audioWrapper.contains(e.target)) {
                document.getElementById("audioMenu")?.classList.remove("active");
            }
        });

        // Global Keyboard Shortcuts
        window.addEventListener("keydown", (e) => {
            // Ignore if user is currently typing in an input
            const activeTag = document.activeElement ? document.activeElement.tagName.toLowerCase() : "";
            if (activeTag === "input" || activeTag === "textarea") return;

            const playerModal = document.getElementById("playerModal");
            const isPlayerActive = playerModal && playerModal.classList.contains("active");

            if (e.key === "Escape") {
                if (isPlayerActive) {
                    this.closePlayer();
                } else if (document.getElementById("detailsModal")?.classList.contains("active")) {
                    this.closeDetailsModal();
                } else if (document.getElementById("plansModal")?.classList.contains("active")) {
                    this.closePlansModal();
                } else if (document.getElementById("authModal")?.classList.contains("active")) {
                    this.closeAuthModal();
                }
            } else if (isPlayerActive) {
                if (e.key === " " || e.code === "Space") {
                    e.preventDefault();
                    this.togglePlayPause();
                } else if (e.key === "ArrowLeft") {
                    e.preventDefault();
                    this.seekRelative(-10);
                } else if (e.key === "ArrowRight") {
                    e.preventDefault();
                    this.seekRelative(10);
                } else if (e.key === "f" || e.key === "F") {
                    e.preventDefault();
                    this.toggleFullscreen();
                } else if (e.key === "m" || e.key === "M") {
                    e.preventDefault();
                    this.toggleMute();
                }
            }
        });
    }

    // ================= AUTHENTICATION & SESSIONS (A_main.py) =================
    loadSession() {
        const saved = localStorage.getItem("beyooneek_user");
        if (saved) {
            try {
                this.currentUser = JSON.parse(saved);
            } catch (e) {
                this.currentUser = null;
            }
        }
        
        // If no user is logged in, default to the seeded VIP account for instant rich testing
        if (!this.currentUser) {
            this.currentUser = {
                id: 1,
                username: "beyooneek_vip",
                plan_name: "Platinum Plan",
                avatar: "avatar-cyber-1"
            };
            localStorage.setItem("beyooneek_user", JSON.stringify(this.currentUser));
        }

        this.updateNavUserUi();
    }

    updateNavUserUi() {
        if (!this.currentUser) return;
        
        document.getElementById("navUsername").textContent = this.currentUser.username;
        document.getElementById("navPlanChip").textContent = this.currentUser.plan_name;
        document.getElementById("dropdownUsername").textContent = this.currentUser.username;
        
        const planBadge = this.currentUser.plan_name === "Platinum Plan" ? "4K Ultra HD • Spatial Audio" :
                          this.currentUser.plan_name === "Gold Plan" ? "Full HD 1080p • Dolby Atmos" :
                          this.currentUser.plan_name === "Silver Plan" ? "HD 720p • 1 Screen" : "Standard (with ads)";
        document.getElementById("dropdownPlanText").textContent = planBadge;

        this.updatePlanHighlights();
    }

    renderAuthMenuActions() {
        const container = document.getElementById("authMenuActions");
        if (!container) return;
        
        if (this.currentUser && this.currentUser.username !== "Guest") {
            container.innerHTML = `
                <a href="javascript:void(0)" class="dropdown-item" onclick="app.openAuthModal()">
                    <i class="fa-solid fa-arrows-rotate"></i> Switch User
                </a>
                <a href="javascript:void(0)" class="dropdown-item" style="color: var(--accent-crimson);" onclick="app.logout()">
                    <i class="fa-solid fa-power-off"></i> Logout
                </a>
            `;
        } else {
            container.innerHTML = `
                <a href="javascript:void(0)" class="dropdown-item" onclick="app.openAuthModal('login')">
                    <i class="fa-solid fa-arrow-right-to-bracket"></i> Login
                </a>
                <a href="javascript:void(0)" class="dropdown-item" onclick="app.openAuthModal('register')">
                    <i class="fa-solid fa-user-plus"></i> Register
                </a>
            `;
        }
    }

    toggleUserMenu() {
        this.playUiSound("click");
        const menu = document.getElementById("userDropdownMenu");
        menu.classList.toggle("active");
    }

    openAuthModal(tab = "login") {
        this.playUiSound("click");
        document.getElementById("authModal").classList.add("active");
        this.switchAuthTab(tab);
        document.getElementById("userDropdownMenu").classList.remove("active");
    }

    closeAuthModal() {
        this.playUiSound("click");
        document.getElementById("authModal").classList.remove("active");
    }

    switchAuthTab(tab) {
        this.playUiSound("click");
        const tabLogin = document.getElementById("tabLogin");
        const tabRegister = document.getElementById("tabRegister");
        const loginForm = document.getElementById("loginForm");
        const registerForm = document.getElementById("registerForm");

        if (tab === "login") {
            tabLogin.classList.add("active");
            tabRegister.classList.remove("active");
            loginForm.style.display = "block";
            registerForm.style.display = "none";
        } else {
            tabRegister.classList.add("active");
            tabLogin.classList.remove("active");
            registerForm.style.display = "block";
            loginForm.style.display = "none";
        }
    }

    async handleLoginSubmit(e) {
        e.preventDefault();
        this.playUiSound("click");
        const username = document.getElementById("loginUsername").value.trim();
        const password = document.getElementById("loginPassword").value;

        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.detail || "Login failed");

            this.currentUser = data;
            localStorage.setItem("beyooneek_user", JSON.stringify(this.currentUser));
            this.updateNavUserUi();
            this.renderAuthMenuActions();
            this.closeAuthModal();
            this.playUiSound("success");
            this.showNotificationToast(`Welcome back, ${this.currentUser.username}!`);
            
            // Reload user specific data
            await this.loadUserHistory();
            await this.loadUserWatchlist();
        } catch (err) {
            this.showNotificationToast(err.message, "error");
        }
    }

    async handleRegisterSubmit(e) {
        e.preventDefault();
        this.playUiSound("click");
        const username = document.getElementById("regUsername").value.trim();
        const password = document.getElementById("regPassword").value;
        const confirm_password = document.getElementById("regConfirmPassword").value;

        if (password !== confirm_password) {
            this.showNotificationToast("Passwords do not match. Confirm carefully!", "error");
            return;
        }

        try {
            const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password, confirm_password })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.detail || "Registration failed");

            this.currentUser = data;
            localStorage.setItem("beyooneek_user", JSON.stringify(this.currentUser));
            this.updateNavUserUi();
            this.renderAuthMenuActions();
            this.closeAuthModal();
            this.playUiSound("success");
            this.showNotificationToast(`Account created! Welcome to BEYOONEEK, ${this.currentUser.username}.`);
            
            // Prompt to select subscription plan (B_account_type.py flow)
            setTimeout(() => {
                this.openPlansModal();
            }, 800);
        } catch (err) {
            this.showNotificationToast(err.message, "error");
        }
    }

    async quickDemoLogin() {
        this.playUiSound("click");
        document.getElementById("loginUsername").value = "beyooneek_vip";
        document.getElementById("loginPassword").value = "vip123";
        const fakeEvent = { preventDefault: () => {} };
        await this.handleLoginSubmit(fakeEvent);
    }

    logout() {
        this.playUiSound("click");
        this.currentUser = {
            id: 0,
            username: "Guest",
            plan_name: "Free Plan",
            avatar: "avatar-guest"
        };
        localStorage.removeItem("beyooneek_user");
        this.updateNavUserUi();
        this.renderAuthMenuActions();
        document.getElementById("userDropdownMenu").classList.remove("active");
        this.showNotificationToast("Logged out from BEYOONEEK. Enjoy your day!");
    }

    // ================= SUBSCRIPTION PLANS & CHECKOUT (B_account_type.py) =================
    async loadPlans() {
        try {
            const res = await fetch("/api/plans");
            const data = await res.json();
            this.plans = data.plans;
        } catch (e) {
            console.error("Failed to load plans", e);
        }
    }

    openPlansModal() {
        this.playUiSound("click");
        document.getElementById("plansModal").classList.add("active");
        document.getElementById("userDropdownMenu").classList.remove("active");
        this.updatePlanHighlights();
    }

    closePlansModal() {
        this.playUiSound("click");
        document.getElementById("plansModal").classList.remove("active");
        document.getElementById("checkoutPortal").style.display = "none";
    }

    selectPlan(planName, price) {
        this.playUiSound("click");
        this.selectedUpgradePlan = planName;
        this.selectedUpgradePrice = price;

        if (price === 0) {
            // Free plan selected directly
            this.updatePlanOnServer("Free Plan", 0);
            return;
        }

        // Open Simulated Purchase Portal (matches B_account_type.py)
        const portal = document.getElementById("checkoutPortal");
        portal.style.display = "block";
        document.getElementById("portalPlanName").textContent = planName;
        document.getElementById("portalPrice").textContent = `$${price}.00`;
        document.getElementById("payBtnAmount").textContent = `$${price}.00`;
        
        // Scroll to checkout portal inside modal
        portal.scrollIntoView({ behavior: "smooth" });
    }

    updatePlanHighlights() {
        const userPlan = this.currentUser ? this.currentUser.plan_name : "Free Plan";
        
        const cardMap = {
            "Free Plan": { card: "planCardFree", btn: "btnSelectFree" },
            "Silver Plan": { card: "planCardSilver", btn: "btnSelectSilver" },
            "Gold Plan": { card: "planCardGold", btn: "btnSelectGold" },
            "Platinum Plan": { card: "planCardPlatinum", btn: "btnSelectPlatinum" },
        };

        for (const [name, ids] of Object.entries(cardMap)) {
            const cardEl = document.getElementById(ids.card);
            const btnEl = document.getElementById(ids.btn);
            if (!cardEl || !btnEl) continue;

            if (userPlan.toLowerCase() === name.toLowerCase()) {
                cardEl.classList.add("active-selected");
                btnEl.textContent = "Current Plan";
                btnEl.style.opacity = "0.7";
                btnEl.style.pointerEvents = "none";
            } else {
                cardEl.classList.remove("active-selected");
                btnEl.textContent = `Select ${name.split(" ")[0]}`;
                btnEl.style.opacity = "1";
                btnEl.style.pointerEvents = "auto";
            }
        }
    }

    setPaymentMethod(method, event) {
        this.playUiSound("click");
        this.currentPaymentMethod = method;
        document.querySelectorAll(".pm-tab").forEach(tab => tab.classList.remove("active"));
        if (event && event.currentTarget) event.currentTarget.classList.add("active");

        const cardInputs = document.getElementById("cardInputs");
        const upiInputs = document.getElementById("upiInputs");

        if (method === "Credit Card" || method === "PayPal") {
            cardInputs.style.display = "block";
            upiInputs.style.display = "none";
        } else {
            cardInputs.style.display = "none";
            upiInputs.style.display = "block";
        }
    }

    updateCardPreview() {
        const holderInput = document.getElementById("cardHolderInput");
        const numInput = document.getElementById("cardNumberInput");
        const expInput = document.getElementById("cardExpInput");

        // Format card number with spaces every 4 digits
        let rawNum = numInput.value.replace(/\D/g, "").substring(0, 16);
        let formattedNum = rawNum.match(/.{1,4}/g)?.join(" ") || rawNum;
        if (formattedNum) numInput.value = formattedNum;

        // Format expiry MM/YY
        let rawExp = expInput.value.replace(/\D/g, "").substring(0, 4);
        if (rawExp.length >= 2) {
            expInput.value = rawExp.substring(0, 2) + "/" + rawExp.substring(2);
        }

        const holder = holderInput.value || "BEYOONEEK VIP";
        const number = numInput.value || "•••• •••• •••• 4242";
        const exp = expInput.value || "12/28";

        document.getElementById("cardDisplayHolder").textContent = holder.toUpperCase();
        document.getElementById("cardDisplayNum").textContent = number;
        document.getElementById("cardDisplayExp").textContent = exp;
    }

    async executePayment() {
        this.playUiSound("click");
        const payBtn = document.getElementById("payNowBtn");
        payBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Processing Secure Payment...';
        payBtn.disabled = true;

        // Simulate 1.2s payment gateway handshake
        await new Promise(r => setTimeout(r, 1200));

        await this.updatePlanOnServer(this.selectedUpgradePlan, this.selectedUpgradePrice);

        payBtn.innerHTML = '<i class="fa-solid fa-lock"></i> Proceed to Pay';
        payBtn.disabled = false;
    }

    cancelPayment() {
        this.playUiSound("click");
        // Matches B_account_type.py: "Payment cancelled. Defaulting to Free Plan."
        this.showNotificationToast("Payment cancelled. Defaulting to Free Plan.");
        document.getElementById("checkoutPortal").style.display = "none";
        this.updatePlanOnServer("Free Plan", 0);
    }

    async updatePlanOnServer(planName, price) {
        try {
            const username = this.currentUser ? this.currentUser.username : "beyooneek_vip";
            const res = await fetch(`/api/subscription/upgrade?username=${encodeURIComponent(username)}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    plan_name: planName,
                    payment_method: this.currentPaymentMethod
                })
            });

            const updatedUser = await res.json();
            if (!res.ok) throw new Error(updatedUser.detail || "Plan upgrade failed");

            this.currentUser = updatedUser;
            localStorage.setItem("beyooneek_user", JSON.stringify(this.currentUser));
            this.updateNavUserUi();
            this.playUiSound("success");
            
            this.showNotificationToast(`Congratulations! Account upgraded to ${planName}. Enjoy streaming!`, "success");
            this.closePlansModal();
        } catch (err) {
            this.showNotificationToast(err.message, "error");
        }
    }

    // ================= HERO CAROUSEL SPOTLIGHT =================
    async loadHeroMovies() {
        try {
            const res = await fetch("/api/movies/hero");
            const data = await res.json();
            this.heroMovies = data.hero_movies || [];
            if (this.heroMovies.length > 0) {
                this.renderHeroMovie(0);
                this.renderHeroDots();
            }
        } catch (e) {
            console.error("Failed to load hero movies", e);
        }
    }

    renderHeroMovie(index) {
        if (!this.heroMovies || this.heroMovies.length === 0) return;
        this.currentHeroIndex = index;
        const movie = this.heroMovies[index];

        const backdropEl = document.getElementById("heroBackdrop");
        backdropEl.style.opacity = "0.2";
        setTimeout(() => {
            backdropEl.style.backgroundImage = `url('${movie.backdrop_url || movie.poster_url}')`;
            backdropEl.style.opacity = "1";
        }, 300);

        document.getElementById("heroTitle").textContent = movie.title;
        document.getElementById("heroQuality").textContent = movie.quality || "4K ULTRA HD";
        document.getElementById("heroRating").innerHTML = `<i class="fa-solid fa-star"></i> ${movie.rating}`;
        document.getElementById("heroMaturity").textContent = movie.maturity_rating || "U/A 16+";
        document.getElementById("heroMatch").innerHTML = `<i class="fa-solid fa-bolt"></i> ${movie.match_pct}% Match`;
        document.getElementById("heroYear").textContent = movie.year;
        document.getElementById("heroDuration").textContent = movie.duration;
        document.getElementById("heroGenres").textContent = movie.genres.split(",").join(" • ");
        document.getElementById("heroDesc").textContent = movie.description;
        document.getElementById("heroCast").innerHTML = `<strong>Starring:</strong> ${movie.cast}`;

        // Watchlist button state
        const isInList = this.watchlist.has(movie.id);
        const listIcon = document.getElementById("heroListIcon");
        const listBtn = document.getElementById("heroWatchlistBtn");
        if (isInList) {
            listIcon.className = "fa-solid fa-check";
            listBtn.style.color = "var(--accent-cyan)";
        } else {
            listIcon.className = "fa-solid fa-plus";
            listBtn.style.color = "#fff";
        }

        // Active dot
        document.querySelectorAll(".hero-dot").forEach((dot, idx) => {
            if (idx === index) dot.classList.add("active");
            else dot.classList.remove("active");
        });
    }

    renderHeroDots() {
        const container = document.getElementById("heroIndicators");
        container.innerHTML = "";
        this.heroMovies.forEach((_, idx) => {
            const dot = document.createElement("div");
            dot.className = `hero-dot ${idx === 0 ? "active" : ""}`;
            dot.onclick = () => {
                this.playUiSound("click");
                this.renderHeroMovie(idx);
                this.resetHeroTimer();
            };
            container.appendChild(dot);
        });
    }

    startHeroCarousel() {
        this.resetHeroTimer();
    }

    resetHeroTimer() {
        if (this.heroTimer) clearInterval(this.heroTimer);
        this.heroTimer = setInterval(() => {
            if (this.heroMovies.length > 0) {
                const nextIndex = (this.currentHeroIndex + 1) % this.heroMovies.length;
                this.renderHeroMovie(nextIndex);
            }
        }, 8000);
    }

    playHeroMovie() {
        this.playUiSound("click");
        const movie = this.heroMovies && this.heroMovies.length > 0 ? this.heroMovies[this.currentHeroIndex] : null;
        if (movie) {
            this.playMovie(movie);
        } else {
            this.playMovieById(1);
        }
    }

    async toggleHeroWatchlist() {
        this.playUiSound("click");
        const movie = this.heroMovies[this.currentHeroIndex];
        if (movie) {
            await this.toggleWatchlist(movie.id);
            this.renderHeroMovie(this.currentHeroIndex);
        }
    }

    openHeroInfoModal() {
        this.playUiSound("click");
        const movie = this.heroMovies[this.currentHeroIndex];
        if (movie) this.openDetailsModal(movie.id);
    }

    toggleHeroSound() {
        this.playUiSound("click");
        this.showNotificationToast("Cinematic Atmos surround audio preview active");
    }

    // ================= CATALOG DATA & CAROUSEL RENDERING =================
    async loadTrendingMovies() {
        try {
            const res = await fetch("/api/movies/trending");
            const data = await res.json();
            
            this.renderTop10Carousel("trendingBollywoodCarousel", data.bollywood_trending || []);
            this.renderTop10Carousel("trendingHollywoodCarousel", data.hollywood_trending || []);
        } catch (e) {
            console.error("Failed to load trending movies", e);
        }
    }

    async loadExploreMovies() {
        try {
            const res = await fetch("/api/movies/explore");
            const data = await res.json();
            
            this.renderStandardCarousel("exploreBollywoodCarousel", data.bollywood_explore || []);
            this.renderStandardCarousel("exploreHollywoodCarousel", data.hollywood_explore || []);
        } catch (e) {
            console.error("Failed to load explore movies", e);
        }
    }

    renderTop10Carousel(containerId, movies) {
        const track = document.getElementById(containerId);
        if (!track) return;
        track.innerHTML = "";

        movies.forEach((movie, index) => {
            const rank = index + 1;
            const item = document.createElement("div");
            item.className = "top-10-item";

            const inList = this.watchlist.has(movie.id);

            item.innerHTML = `
                <div class="top-10-rank">${rank}</div>
                <div class="top-10-card" onclick="app.openDetailsModal(${movie.id})">
                    <img class="card-poster" src="${movie.poster_url}" alt="${movie.title}" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=600'">
                    <div class="card-overlay">
                        <div class="card-top-badges">
                            <span class="card-badge-vip">${movie.quality || "4K UHD"}</span>
                        </div>
                        <div class="card-info">
                            <h4 class="card-title">${movie.title}</h4>
                            <div class="card-meta">
                                <span class="card-meta-match">${movie.match_pct}% Match</span>
                                <span>${movie.year}</span>
                                <span>${movie.duration}</span>
                            </div>
                            <div class="card-actions-hover">
                                <button class="card-btn-play" onclick="event.stopPropagation(); app.playMovieById(${movie.id})" title="Stream Now">
                                    <i class="fa-solid fa-play"></i>
                                </button>
                                <button class="card-btn-icon" onclick="event.stopPropagation(); app.toggleWatchlist(${movie.id})" title="Watchlist">
                                    <i class="${inList ? 'fa-solid fa-check' : 'fa-solid fa-plus'}"></i>
                                </button>
                                <button class="card-btn-icon" onclick="event.stopPropagation(); app.openDetailsModal(${movie.id})" title="Info">
                                    <i class="fa-solid fa-circle-info"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            track.appendChild(item);
        });
    }

    renderStandardCarousel(containerId, movies) {
        const track = document.getElementById(containerId);
        if (!track) return;
        track.innerHTML = "";

        movies.forEach(movie => {
            const card = document.createElement("div");
            card.className = "movie-card";
            card.onclick = () => this.openDetailsModal(movie.id);

            const inList = this.watchlist.has(movie.id);

            card.innerHTML = `
                <img class="card-poster" src="${movie.poster_url}" alt="${movie.title}" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=600'">
                <div class="card-overlay">
                    <div class="card-top-badges">
                        <span class="card-badge-vip">${movie.quality || "4K"}</span>
                    </div>
                    <div class="card-info">
                        <h4 class="card-title">${movie.title}</h4>
                        <div class="card-meta">
                            <span class="card-meta-match">${movie.match_pct}% Match</span>
                            <span>${movie.year}</span>
                            <span>${movie.maturity_rating}</span>
                        </div>
                        <div class="card-actions-hover">
                            <button class="card-btn-play" onclick="event.stopPropagation(); app.playMovieById(${movie.id})" title="Play">
                                <i class="fa-solid fa-play"></i>
                            </button>
                            <button class="card-btn-icon" onclick="event.stopPropagation(); app.toggleWatchlist(${movie.id})" title="Watchlist">
                                <i class="${inList ? 'fa-solid fa-check' : 'fa-solid fa-plus'}"></i>
                            </button>
                            <button class="card-btn-icon" onclick="event.stopPropagation(); app.openDetailsModal(${movie.id})" title="Info">
                                <i class="fa-solid fa-circle-info"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `;
            track.appendChild(card);
        });
    }

    scrollCarousel(carouselId, direction) {
        this.playUiSound("click");
        const track = document.getElementById(carouselId);
        if (track) {
            const scrollAmount = 600 * direction;
            track.scrollBy({ left: scrollAmount, behavior: "smooth" });
        }
    }

    // ================= CONTINUE WATCHING (F_continue_watching.py & C_dashboard.py) =================
    async loadUserHistory() {
        if (!this.currentUser || !this.currentUser.username) return;
        try {
            const res = await fetch(`/api/history?username=${encodeURIComponent(this.currentUser.username)}`);
            const data = await res.json();
            this.continueHistory = data.history || [];
            this.renderContinueWatching();
        } catch (e) {
            console.error("Failed to load user watch history", e);
        }
    }

    renderContinueWatching() {
        const track = document.getElementById("continueCarousel");
        if (!track) return;
        track.innerHTML = "";

        if (this.continueHistory.length === 0) {
            track.innerHTML = `
                <div class="empty-continue-box">
                    <i class="fa-solid fa-film" style="font-size: 2rem; margin-bottom: 10px; color: var(--accent-cyan);"></i>
                    <h4>No active streams in history yet!</h4>
                    <p style="font-size: 0.85rem; margin-top: 4px;">Explore our Trending Bollywood or Hollywood titles and hit Play to begin streaming.</p>
                </div>
            `;
            return;
        }

        this.continueHistory.forEach(item => {
            const movie = item.movie;
            if (!movie) return;

            const card = document.createElement("div");
            card.className = "continue-card";

            card.innerHTML = `
                <div class="continue-thumb-wrapper" onclick="app.playMovieById(${movie.id}, ${item.progress_seconds})">
                    <img class="continue-thumb" src="${movie.backdrop_url || movie.poster_url}" alt="${movie.title}" onerror="this.src='https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800'">
                    <div class="continue-play-overlay">
                        <div class="continue-play-icon">
                            <i class="fa-solid fa-play"></i>
                        </div>
                    </div>
                    <div class="continue-progress-bar">
                        <div class="continue-progress-fill" style="width: ${item.progress_percentage}%"></div>
                    </div>
                </div>
                <div class="continue-card-info">
                    <div>
                        <div class="continue-card-title">${movie.title}</div>
                        <span class="continue-card-pct"><i class="fa-solid fa-rotate-right"></i> ${item.progress_percentage}% completed</span>
                    </div>
                    <button class="continue-remove-btn" onclick="event.stopPropagation(); app.deleteHistoryItem(${movie.id})" title="Remove from Continue Watching">
                        <i class="fa-solid fa-xmark"></i>
                    </button>
                </div>
            `;
            track.appendChild(card);
        });
    }

    async deleteHistoryItem(movieId) {
        this.playUiSound("click");
        if (!this.currentUser) return;
        try {
            await fetch(`/api/history/${movieId}?username=${encodeURIComponent(this.currentUser.username)}`, {
                method: "DELETE"
            });
            this.continueHistory = this.continueHistory.filter(h => h.movie_id !== movieId);
            this.renderContinueWatching();
            this.showNotificationToast("Removed title from Continue Watching");
        } catch (e) {
            console.error(e);
        }
    }

    // ================= WATCHLIST =================
    async loadUserWatchlist() {
        if (!this.currentUser || !this.currentUser.username) return;
        try {
            const res = await fetch(`/api/watchlist?username=${encodeURIComponent(this.currentUser.username)}`);
            const data = await res.json();
            const list = data.watchlist || [];
            this.watchlist = new Set(list.map(m => m.id));
            
            document.getElementById("watchlistCount").textContent = `${list.length} titles`;
            this.renderStandardCarousel("watchlistCarousel", list);
        } catch (e) {
            console.error("Failed to load user watchlist", e);
        }
    }

    async toggleWatchlist(movieId) {
        this.playUiSound("click");
        if (!this.currentUser) {
            this.openAuthModal("login");
            return;
        }

        try {
            const res = await fetch(`/api/watchlist/toggle?username=${encodeURIComponent(this.currentUser.username)}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ movie_id: movieId })
            });
            const data = await res.json();
            
            if (data.in_watchlist) {
                this.watchlist.add(movieId);
            } else {
                this.watchlist.delete(movieId);
            }

            this.showNotificationToast(data.message);
            await this.loadUserWatchlist();
            await this.loadTrendingMovies();
            await this.loadExploreMovies();
        } catch (e) {
            console.error(e);
        }
    }

    // ================= FULLSCREEN CINEMA VIDEO PLAYER =================
    initVideoEventListeners() {
        if (!this.videoEl) return;

        this.videoEl.addEventListener("timeupdate", () => this.handleTimeUpdate());
        this.videoEl.addEventListener("ended", () => this.handleVideoEnded());
        this.videoEl.addEventListener("play", () => {
            document.getElementById("playPauseIcon").className = "fa-solid fa-pause";
        });
        this.videoEl.addEventListener("pause", () => {
            document.getElementById("playPauseIcon").className = "fa-solid fa-play";
        });

        // Click anywhere on video to toggle Play / Pause
        this.videoEl.addEventListener("click", () => {
            this.togglePlayPause();
        });

        // Inactivity Timer: Auto-hide top and bottom bars for cinema immersion
        const playerContainer = document.querySelector(".player-container");
        if (playerContainer) {
            playerContainer.addEventListener("mousemove", () => {
                this.showPlayerControls();
            });
            playerContainer.addEventListener("mouseleave", () => {
                if (this.videoEl && !this.videoEl.paused) {
                    this.hidePlayerControls();
                }
            });
        }
    }

    showPlayerControls() {
        const topBar = document.getElementById("playerTopBar");
        const bottomBar = document.getElementById("playerBottomBar");
        if (topBar) topBar.classList.remove("hide-controls");
        if (bottomBar) bottomBar.classList.remove("hide-controls");

        if (this.controlsTimeout) clearTimeout(this.controlsTimeout);
        if (this.videoEl && !this.videoEl.paused) {
            this.controlsTimeout = setTimeout(() => {
                this.hidePlayerControls();
            }, 3500);
        }
    }

    hidePlayerControls() {
        // Do not hide controls if any popover is open
        const speedOpen = document.getElementById("speedMenu")?.classList.contains("active");
        const qualityOpen = document.getElementById("qualityMenu")?.classList.contains("active");
        const audioOpen = document.getElementById("audioMenu")?.classList.contains("active");
        if (speedOpen || qualityOpen || audioOpen) return;

        const topBar = document.getElementById("playerTopBar");
        const bottomBar = document.getElementById("playerBottomBar");
        if (topBar) topBar.classList.add("hide-controls");
        if (bottomBar) bottomBar.classList.add("hide-controls");
    }

    async playMovieById(movieId, resumeSeconds = 0) {
        try {
            const res = await fetch(`/api/movies/${movieId}`);
            const data = await res.json();
            if (data.movie) {
                this.playMovie(data.movie, resumeSeconds);
            }
        } catch (e) {
            console.error("Failed to fetch and play movie:", movieId, e);
        }
    }

    playMovie(movie, resumeSeconds = 0) {
        if (!movie) {
            console.warn("playMovie was invoked without a valid movie payload.");
            return;
        }

        this.playUiSound("click");
        this.activeMovie = movie;

        // Cleanly close details modal if open so player has full focus
        const detailsModal = document.getElementById("detailsModal");
        if (detailsModal) detailsModal.classList.remove("active");
        this.activeModalMovie = null;

        const modal = document.getElementById("playerModal");
        if (modal) modal.classList.add("active");
        this.showPlayerControls();

        // Update Top Bar movie info dynamically to match selected movie
        const titleEl = document.getElementById("playerMovieTitle");
        if (titleEl) titleEl.textContent = movie.title || "Movie Title";

        const yearEl = document.getElementById("playerMovieYear");
        if (yearEl) yearEl.textContent = movie.year || "2025";

        const catEl = document.getElementById("playerMovieCategory");
        if (catEl) catEl.textContent = movie.category || "Cinema";

        const qualityBadge = document.getElementById("playerQualityBadge");
        if (qualityBadge) qualityBadge.textContent = movie.quality || "4K ULTRA HD";

        const watchIcon = document.getElementById("playerWatchlistIcon");
        if (watchIcon) {
            const inList = this.watchlist.has(movie.id);
            watchIcon.className = inList ? "fa-solid fa-check" : "fa-solid fa-plus";
        }
        
        const userPlan = this.currentUser ? this.currentUser.plan_name : "Free Plan";
        const planEl = document.getElementById("playerActivePlan");
        if (planEl) planEl.textContent = userPlan;

        // Visual toast notification confirming the movie currently streaming
        this.showNotificationToast(`Now Streaming: ${movie.title}`);

        // Check if user is on Free Plan -> show simulated 5s ad overlay (matching B_account_type.py)
        if (userPlan.toLowerCase().includes("free")) {
            this.showSimulatedAd();
        } else {
            const adOverlay = document.getElementById("adOverlay");
            if (adOverlay) adOverlay.style.display = "none";
        }

        // 3 standard demo videos distributed across all movies in alternate pattern
        const demoVideos = [
            "/static/videos/trailer_oceans.mp4",
            "/static/videos/demo.mp4",
            "/static/videos/flower.mp4"
        ];
        const defaultStream = movie.id ? demoVideos[(movie.id - 1) % demoVideos.length] : demoVideos[0];
        const streamUrl = movie.video_url || defaultStream;

        if (!this.videoEl) {
            this.videoEl = document.getElementById("cinemaVideo");
        }

        if (this.videoEl) {
            this.videoEl.pause();
            this.videoEl.src = streamUrl;
            const source = document.getElementById("videoSource");
            if (source) source.src = streamUrl;
            this.videoEl.load();

            if (resumeSeconds > 0) {
                this.videoEl.currentTime = resumeSeconds;
                this.showNotificationToast(`Resuming stream from ${this.formatTime(resumeSeconds)}`);
            } else {
                this.videoEl.currentTime = 0;
            }

            const playPromise = this.videoEl.play();
            if (playPromise !== undefined) {
                playPromise.catch(e => console.warn("Auto-play prevented", e));
            }
        }

        // Start Periodic Progress Tracking (every 5 seconds)
        this.startProgressTracking();
    }

    showSimulatedAd() {
        this.isAdActive = true;
        const adBox = document.getElementById("adOverlay");
        const countdownEl = document.getElementById("adCountdown");
        const skipBtn = document.getElementById("skipAdBtn");
        
        adBox.style.display = "block";
        skipBtn.disabled = true;
        
        let timeLeft = 5;
        countdownEl.textContent = `Ad will skip in ${timeLeft}s...`;
        skipBtn.textContent = `Skip Ad (${timeLeft})`;

        if (this.adTimer) clearInterval(this.adTimer);
        this.adTimer = setInterval(() => {
            timeLeft--;
            if (timeLeft > 0) {
                countdownEl.textContent = `Ad will skip in ${timeLeft}s...`;
                skipBtn.textContent = `Skip Ad (${timeLeft})`;
            } else {
                clearInterval(this.adTimer);
                skipBtn.disabled = false;
                skipBtn.textContent = "Skip Ad Now";
                countdownEl.textContent = "You can skip this ad";
            }
        }, 1000);
    }

    skipAd() {
        this.playUiSound("click");
        if (this.adTimer) clearInterval(this.adTimer);
        document.getElementById("adOverlay").style.display = "none";
        this.isAdActive = false;
    }

    startProgressTracking() {
        if (this.progressTimer) clearInterval(this.progressTimer);
        this.progressTimer = setInterval(() => {
            this.syncWatchProgress();
        }, 5000);
    }

    async syncWatchProgress() {
        if (!this.activeMovie || !this.videoEl || !this.currentUser) return;
        const currentSec = Math.floor(this.videoEl.currentTime);
        const durationSec = Math.floor(this.videoEl.duration) || this.activeMovie.duration_seconds;

        if (currentSec <= 1) return;

        try {
            await fetch(`/api/history/update?username=${encodeURIComponent(this.currentUser.username)}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    movie_id: this.activeMovie.id,
                    progress_seconds: currentSec,
                    duration_seconds: durationSec
                })
            });
        } catch (e) {
            console.error("Failed to sync watch progress", e);
        }
    }

    closePlayer() {
        this.playUiSound("click");
        if (this.controlsTimeout) clearTimeout(this.controlsTimeout);
        if (document.fullscreenElement) {
            document.exitFullscreen().catch(() => {});
        }
        if (this.videoEl) {
            this.syncWatchProgress();
            this.videoEl.pause();
        }
        if (this.progressTimer) clearInterval(this.progressTimer);
        if (this.adTimer) clearInterval(this.adTimer);

        document.getElementById("playerModal").classList.remove("active");
        this.activeMovie = null;

        // Refresh continue watching row immediately
        this.loadUserHistory();
    }

    togglePlayPause() {
        this.playUiSound("click");
        if (!this.videoEl) return;
        if (this.videoEl.paused) {
            this.videoEl.play();
        } else {
            this.videoEl.pause();
        }
    }

    seekRelative(seconds) {
        this.playUiSound("click");
        if (!this.videoEl) return;
        this.videoEl.currentTime = Math.max(0, Math.min(this.videoEl.currentTime + seconds, this.videoEl.duration));
    }

    setVolume(val) {
        if (!this.videoEl) return;
        this.videoEl.volume = parseFloat(val);
        const icon = document.getElementById("volumeIcon");
        if (this.videoEl.volume === 0) icon.className = "fa-solid fa-volume-xmark";
        else if (this.videoEl.volume < 0.5) icon.className = "fa-solid fa-volume-low";
        else icon.className = "fa-solid fa-volume-high";
    }

    toggleMute() {
        this.playUiSound("click");
        if (!this.videoEl) return;
        this.videoEl.muted = !this.videoEl.muted;
        const icon = document.getElementById("volumeIcon");
        if (this.videoEl.muted) {
            icon.className = "fa-solid fa-volume-xmark";
        } else {
            icon.className = "fa-solid fa-volume-high";
        }
    }

    handleTimeUpdate() {
        if (!this.videoEl) return;
        const cur = this.videoEl.currentTime;
        const dur = this.videoEl.duration || 1;
        const pct = (cur / dur) * 100;

        document.getElementById("scrubberProgress").style.width = `${pct}%`;
        document.getElementById("currentTimeText").textContent = this.formatTime(cur);
        document.getElementById("totalDurationText").textContent = this.formatTime(dur);

        // Update buffered
        if (this.videoEl.buffered.length > 0) {
            const bufferedEnd = this.videoEl.buffered.end(this.videoEl.buffered.length - 1);
            const bufPct = (bufferedEnd / dur) * 100;
            document.getElementById("scrubberBuffered").style.width = `${bufPct}%`;
        }
    }

    handleScrubberClick(e) {
        if (!this.videoEl) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const pos = (e.clientX - rect.left) / rect.width;
        this.videoEl.currentTime = pos * this.videoEl.duration;
    }

    handleScrubberHover(e) {
        if (!this.videoEl) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const pos = (e.clientX - rect.left) / rect.width;
        const hoverSec = pos * (this.videoEl.duration || 0);

        const tooltip = document.getElementById("scrubberTooltip");
        tooltip.textContent = this.formatTime(hoverSec);
        tooltip.style.left = `${pos * 100}%`;
    }

    handleVideoEnded() {
        this.showNotificationToast("Stream finished. Playing next recommendation...");
        this.closePlayer();
    }

    formatTime(seconds) {
        const s = Math.floor(seconds);
        const mins = Math.floor(s / 60);
        const secs = s % 60;
        return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }

    toggleSpeedMenu() {
        this.playUiSound("click");
        document.getElementById("speedMenu").classList.toggle("active");
        document.getElementById("qualityMenu").classList.remove("active");
        document.getElementById("audioMenu").classList.remove("active");
    }

    setSpeed(speed) {
        this.playUiSound("click");
        if (!this.videoEl) return;
        this.selectedSpeed = speed;
        this.videoEl.playbackRate = speed;
        document.getElementById("speedBadge").textContent = `${speed}x`;
        document.getElementById("speedMenu").classList.remove("active");
        this.showNotificationToast(`Playback speed set to ${speed}x`);
    }

    toggleQualityMenu() {
        this.playUiSound("click");
        document.getElementById("qualityMenu").classList.toggle("active");
        document.getElementById("speedMenu").classList.remove("active");
        document.getElementById("audioMenu").classList.remove("active");
    }

    changeQuality(qualityName) {
        this.playUiSound("click");
        const userPlan = this.currentUser ? this.currentUser.plan_name : "Free Plan";

        // Check plan eligibility
        if (qualityName.includes("4K") && !userPlan.includes("Platinum")) {
            this.showNotificationToast("4K Ultra HD is exclusive to Platinum Plan ($20). Upgrade now!", "error");
            this.openPlansModal();
            return;
        }
        if (qualityName.includes("Full HD") && (userPlan.includes("Free") || userPlan.includes("Silver"))) {
            this.showNotificationToast("Full HD 1080p is available on Gold or Platinum Plans.", "error");
            this.openPlansModal();
            return;
        }

        this.selectedQuality = qualityName;
        document.getElementById("qualityBadgePill").textContent = qualityName.split(" ")[0];
        document.getElementById("playerQualityBadge").textContent = qualityName;
        document.getElementById("qualityMenu").classList.remove("active");
        this.showNotificationToast(`Resolution adjusted to ${qualityName}`);
    }

    toggleAudioMenu() {
        this.playUiSound("click");
        const menu = document.getElementById("audioMenu");
        menu.classList.toggle("active");

        if (this.activeMovie) {
            const audioDiv = document.getElementById("audioLanguagesList");
            const subDiv = document.getElementById("subtitlesList");
            
            const audios = this.activeMovie.audio_languages ? this.activeMovie.audio_languages.split(",") : ["Original [Hindi/English]"];
            const subs = this.activeMovie.subtitles ? this.activeMovie.subtitles.split(",") : ["English", "Off"];

            audioDiv.innerHTML = audios.map((a, i) => `<button class="${i === 0 ? 'active' : ''}" onclick="app.setAudio('${a.trim()}')">${a.trim()}</button>`).join("");
            subDiv.innerHTML = subs.map((s, i) => `<button class="${i === 0 ? 'active' : ''}" onclick="app.setSubtitle('${s.trim()}')">${s.trim()}</button>`).join("");
        }
    }

    setAudio(lang) {
        this.playUiSound("click");
        this.showNotificationToast(`Audio track set to: ${lang}`);
        document.getElementById("audioMenu").classList.remove("active");
    }

    setSubtitle(sub) {
        this.playUiSound("click");
        this.showNotificationToast(`Subtitles: ${sub}`);
        document.getElementById("audioMenu").classList.remove("active");
    }

    toggleFullscreen() {
        this.playUiSound("click");
        const container = document.getElementById("playerModal");
        if (!document.fullscreenElement) {
            container.requestFullscreen().catch(err => console.warn(err));
        } else {
            document.exitFullscreen().catch(err => console.warn(err));
        }
    }

    async toggleWatchlistFromPlayer() {
        if (this.activeMovie) {
            await this.toggleWatchlist(this.activeMovie.id);
            const inList = this.watchlist.has(this.activeMovie.id);
            document.getElementById("playerWatchlistIcon").className = inList ? "fa-solid fa-check" : "fa-solid fa-plus";
        }
    }

    // ================= RICH MOVIE DETAILS MODAL =================
    async openDetailsModal(movieId) {
        this.playUiSound("click");
        try {
            const res = await fetch(`/api/movies/${movieId}`);
            const data = await res.json();
            const movie = data.movie;
            if (!movie) return;

            const modal = document.getElementById("detailsModal");
            modal.classList.add("active");

            // Reset scroll position to top of modal
            const modalCard = modal.querySelector(".modal-card");
            if (modalCard) modalCard.scrollTop = 0;

            // Hero Backdrop
            document.getElementById("detailHero").style.backgroundImage = `url('${movie.backdrop_url || movie.poster_url}')`;
            document.getElementById("detailTitle").textContent = movie.title;
            document.getElementById("detailMatch").innerHTML = `<i class="fa-solid fa-bolt"></i> ${movie.match_pct}% Match`;
            document.getElementById("detailQuality").textContent = movie.quality;
            document.getElementById("detailRating").innerHTML = `<i class="fa-solid fa-star"></i> ${movie.rating}`;
            document.getElementById("detailMaturity").textContent = movie.maturity_rating;
            document.getElementById("detailYear").textContent = movie.year;
            document.getElementById("detailDuration").textContent = movie.duration;

            document.getElementById("detailDesc").textContent = movie.description;
            document.getElementById("detailCast").textContent = movie.cast;
            document.getElementById("detailDirector").textContent = movie.director;
            document.getElementById("detailGenres").textContent = movie.genres;
            document.getElementById("detailCategory").textContent = movie.category;
            document.getElementById("detailAudio").textContent = movie.audio_languages;
            document.getElementById("detailSubtitles").textContent = movie.subtitles;

            // Watchlist button
            const inList = this.watchlist.has(movie.id);
            document.getElementById("detailListIcon").className = inList ? "fa-solid fa-check" : "fa-solid fa-plus";

            // Save active modal movie
            this.activeModalMovie = movie;

            // Render Similar Movies with rich cards
            const similarGrid = document.getElementById("similarGrid");
            similarGrid.innerHTML = "";
            (data.similar || []).forEach(sim => {
                const item = document.createElement("div");
                item.className = "similar-card";
                item.onclick = () => this.openDetailsModal(sim.id);
                item.innerHTML = `
                    <div class="similar-thumb-wrap">
                        <img class="similar-thumb" src="${sim.backdrop_url || sim.poster_url}" alt="${sim.title}" onerror="this.src='https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400'">
                        <div class="similar-play-hover" onclick="event.stopPropagation(); app.playMovieById(${sim.id})" title="Stream Now">
                            <i class="fa-solid fa-play"></i>
                        </div>
                        <span class="similar-badge-quality">${sim.quality ? sim.quality.split(" ")[0] : "4K"}</span>
                    </div>
                    <div class="similar-info">
                        <h5 title="${sim.title}">${sim.title}</h5>
                        <div class="similar-meta-row">
                            <span class="similar-match">${sim.match_pct || 96}%</span>
                            <span>${sim.year}</span>
                            <span class="similar-rating"><i class="fa-solid fa-star"></i> ${sim.rating}</span>
                        </div>
                    </div>
                `;
                similarGrid.appendChild(item);
            });
        } catch (e) {
            console.error(e);
        }
    }

    closeDetailsModal() {
        this.playUiSound("click");
        document.getElementById("detailsModal").classList.remove("active");
        this.activeModalMovie = null;
    }

    playDetailMovie() {
        if (this.activeModalMovie) {
            const movieToPlay = this.activeModalMovie;
            this.closeDetailsModal();
            this.playMovie(movieToPlay);
        }
    }

    async toggleDetailWatchlist() {
        if (this.activeModalMovie) {
            await this.toggleWatchlist(this.activeModalMovie.id);
            const inList = this.watchlist.has(this.activeModalMovie.id);
            document.getElementById("detailListIcon").className = inList ? "fa-solid fa-check" : "fa-solid fa-plus";
        }
    }

    // ================= REAL-TIME SEARCH =================
    toggleSearch() {
        this.playUiSound("click");
        document.getElementById("searchInput").focus();
    }

    async handleSearchInput(e) {
        const query = e.target.value.trim();
        const clearBtn = document.getElementById("clearSearchBtn");
        const resultsSection = document.getElementById("searchResultsSection");
        const resultsGrid = document.getElementById("searchGrid");
        const keywordSpan = document.getElementById("searchKeyword");
        const countSpan = document.getElementById("resultsCount");

        if (query.length > 0) {
            clearBtn.style.display = "block";
            resultsSection.style.display = "block";
            keywordSpan.textContent = query;

            try {
                const res = await fetch(`/api/movies?search=${encodeURIComponent(query)}`);
                const data = await res.json();
                const list = data.movies || [];

                countSpan.textContent = `${list.length} title${list.length === 1 ? '' : 's'} found`;
                resultsGrid.innerHTML = "";

                if (list.length === 0) {
                    resultsGrid.innerHTML = `
                        <div style="grid-column: 1 / -1; padding: 40px; text-align: center; color: var(--text-secondary);">
                            <i class="fa-solid fa-face-frown" style="font-size: 2rem; margin-bottom: 12px; color: var(--accent-crimson);"></i>
                            <h3>No matches found for "${query}"</h3>
                            <p style="font-size: 0.85rem; margin-top: 6px;">Try searching by movie title, actor (e.g. Vicky Kaushal, Tom Cruise), or genres.</p>
                        </div>
                    `;
                } else {
                    list.forEach(movie => {
                        const card = document.createElement("div");
                        card.className = "movie-card";
                        card.onclick = () => this.openDetailsModal(movie.id);
                        const inList = this.watchlist.has(movie.id);
                        card.innerHTML = `
                            <img class="card-poster" src="${movie.poster_url}" alt="${movie.title}" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=600'">
                            <div class="card-overlay">
                                <div class="card-top-badges">
                                    <span class="card-badge-vip">${movie.quality || "4K"}</span>
                                </div>
                                <div class="card-info">
                                    <h4 class="card-title">${movie.title}</h4>
                                    <div class="card-meta">
                                        <span class="card-meta-match">${movie.match_pct}%</span>
                                        <span>${movie.year}</span>
                                        <span>${movie.category}</span>
                                    </div>
                                    <div class="card-actions-hover">
                                        <button class="card-btn-play" onclick="event.stopPropagation(); app.playMovieById(${movie.id})" title="Stream Now">
                                            <i class="fa-solid fa-play"></i>
                                        </button>
                                        <button class="card-btn-icon" onclick="event.stopPropagation(); app.toggleWatchlist(${movie.id})" title="Watchlist">
                                            <i class="${inList ? 'fa-solid fa-check' : 'fa-solid fa-plus'}"></i>
                                        </button>
                                        <button class="card-btn-icon" onclick="event.stopPropagation(); app.openDetailsModal(${movie.id})" title="Info">
                                            <i class="fa-solid fa-circle-info"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        `;
                        resultsGrid.appendChild(card);
                    });
                }
            } catch (err) {
                console.error(err);
            }
        } else {
            clearBtn.style.display = "none";
            resultsSection.style.display = "none";
        }
    }

    clearSearch() {
        this.playUiSound("click");
        const input = document.getElementById("searchInput");
        input.value = "";
        document.getElementById("clearSearchBtn").style.display = "none";
        document.getElementById("searchResultsSection").style.display = "none";
    }

    // ================= CATEGORY & NAVIGATION SHORTCUTS =================
    navigateSection(section) {
        this.playUiSound("click");
        document.querySelectorAll(".nav-link").forEach(l => l.classList.remove("active"));
        const targetLink = document.querySelector(`.nav-link[data-nav="${section}"]`);
        if (targetLink) targetLink.classList.add("active");

        if (section === "home") {
            window.scrollTo({ top: 0, behavior: "smooth" });
        } else if (section === "trending") {
            document.getElementById("bollywood-section").scrollIntoView({ behavior: "smooth" });
        } else if (section === "watchlist") {
            document.getElementById("watchlist-section").scrollIntoView({ behavior: "smooth" });
        } else if (section === "continue") {
            document.getElementById("continue-section").scrollIntoView({ behavior: "smooth" });
        }
    }

    navigateCategory(cat) {
        this.playUiSound("click");
        if (cat === "Bollywood") {
            document.getElementById("bollywood-section").scrollIntoView({ behavior: "smooth" });
        } else if (cat === "Hollywood") {
            document.getElementById("hollywood-section").scrollIntoView({ behavior: "smooth" });
        } else {
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    }

    scrollToSection(id) {
        this.playUiSound("click");
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: "smooth" });
    }

    filterMovies(type, event) {
        this.playUiSound("click");
        document.querySelectorAll(".filter-pill").forEach(p => p.classList.remove("active"));
        if (event && event.currentTarget) event.currentTarget.classList.add("active");

        if (type === "all") {
            this.clearSearch();
            window.scrollTo({ top: 0, behavior: "smooth" });
        } else if (type === "trending") {
            this.clearSearch();
            this.scrollToSection("bollywood-section");
        } else if (type === "bollywood") {
            this.clearSearch();
            this.scrollToSection("bollywood-section");
        } else if (type === "hollywood") {
            this.clearSearch();
            this.scrollToSection("hollywood-section");
        } else if (type === "watchlist") {
            this.clearSearch();
            this.scrollToSection("watchlist-section");
        } else {
            // Action, Sci-Fi, Drama quick search filter
            const searchInput = document.getElementById("searchInput");
            searchInput.value = type;
            this.handleSearchInput({ target: searchInput });
            this.scrollToSection("searchResultsSection");
        }
    }

    // ================= TOAST NOTIFICATIONS =================
    showNotificationToast(msg, type = "info") {
        const container = document.getElementById("toastContainer");
        if (!container) return;

        const toast = document.createElement("div");
        toast.className = `toast toast-${type}`;

        const icon = type === "success" ? "fa-circle-check" :
                     type === "error" ? "fa-circle-exclamation" : "fa-bell";

        toast.innerHTML = `<i class="fa-solid ${icon}"></i> <span>${msg}</span>`;
        container.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = "0";
            toast.style.transform = "translateX(50px)";
            setTimeout(() => toast.remove(), 300);
        }, 4000);
    }
}

// Global App Instance
const app = new BeyooneekApp();

// Boot application upon DOM ready
document.addEventListener("DOMContentLoaded", () => {
    app.init();
});
