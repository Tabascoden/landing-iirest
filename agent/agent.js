(function () {
  var header = document.querySelector("[data-header]");
  var menu = document.querySelector("[data-menu]");
  var menuToggle = document.querySelector("[data-menu-toggle]");
  var toast = document.querySelector("[data-toast]");

  function setHeaderState() {
    if (!header) return;
    header.classList.toggle("is-scrolled", window.scrollY > 8);
  }

  function closeMenu() {
    if (!menu || !menuToggle) return;
    menu.classList.remove("is-open");
    menuToggle.setAttribute("aria-expanded", "false");
    document.body.classList.remove("menu-open");
  }

  function initMobileMenu() {
    if (!menu || !menuToggle) return;

    menuToggle.addEventListener("click", function () {
      var isOpen = menu.classList.toggle("is-open");
      menuToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
      document.body.classList.toggle("menu-open", isOpen);
    });

    menu.addEventListener("click", function (event) {
      if (event.target && event.target.closest("a")) {
        closeMenu();
      }
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") closeMenu();
    });
  }

  function initSmoothScroll() {
    document.addEventListener("click", function (event) {
      var link = event.target instanceof Element ? event.target.closest("a[href^='#']") : null;
      if (!link) return;

      var id = link.getAttribute("href");
      if (!id || id === "#") return;

      var target = document.querySelector(id);
      if (!target) return;

      event.preventDefault();
      target.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });

      if (history.pushState) {
        history.pushState(null, "", id);
      }
    });
  }

  function initRoleTabs() {
    var root = document.querySelector("[data-role-tabs]");
    if (!root) return;

    var tabs = Array.prototype.slice.call(root.querySelectorAll("[data-role-tab]"));
    var panels = Array.prototype.slice.call(root.querySelectorAll("[data-role-panel]"));
    if (tabs.length === 0 || panels.length === 0) return;

    function setActive(tab, shouldFocus) {
      var name = tab.getAttribute("data-role-tab");

      tabs.forEach(function (item) {
        var isActive = item === tab;
        item.setAttribute("aria-selected", isActive ? "true" : "false");
        item.tabIndex = isActive ? 0 : -1;
      });

      panels.forEach(function (panel) {
        var isActive = panel.getAttribute("data-role-panel") === name;
        panel.hidden = !isActive;
        panel.classList.toggle("is-active", isActive);
      });

      if (shouldFocus) tab.focus();
    }

    tabs.forEach(function (tab, index) {
      tab.addEventListener("click", function () {
        setActive(tab, false);
      });

      tab.addEventListener("keydown", function (event) {
        if (event.key !== "ArrowRight" && event.key !== "ArrowLeft" && event.key !== "Home" && event.key !== "End") {
          return;
        }

        event.preventDefault();
        var nextIndex = index;
        if (event.key === "ArrowRight") nextIndex = (index + 1) % tabs.length;
        if (event.key === "ArrowLeft") nextIndex = (index - 1 + tabs.length) % tabs.length;
        if (event.key === "Home") nextIndex = 0;
        if (event.key === "End") nextIndex = tabs.length - 1;
        setActive(tabs[nextIndex], true);
      });
    });
  }

  function initFaq() {
    var root = document.querySelector("[data-faq]");
    if (!root) return;

    var items = Array.prototype.slice.call(root.querySelectorAll(".faq-item"));
    items.forEach(function (item) {
      var button = item.querySelector("button");
      var answer = item.querySelector(".faq-answer");
      if (!button || !answer) return;

      button.addEventListener("click", function () {
        var shouldOpen = button.getAttribute("aria-expanded") !== "true";

        items.forEach(function (other) {
          var otherButton = other.querySelector("button");
          var otherAnswer = other.querySelector(".faq-answer");
          if (!otherButton || !otherAnswer) return;
          otherButton.setAttribute("aria-expanded", "false");
          otherAnswer.hidden = true;
        });

        button.setAttribute("aria-expanded", shouldOpen ? "true" : "false");
        answer.hidden = !shouldOpen;
      });
    });
  }

  function initReveal() {
    var nodes = Array.prototype.slice.call(document.querySelectorAll(".reveal"));
    if (nodes.length === 0) return;

    if (!("IntersectionObserver" in window)) {
      nodes.forEach(function (node) {
        node.classList.add("is-visible");
      });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    }, {
      threshold: 0.12,
      rootMargin: "0px 0px -40px 0px"
    });

    nodes.forEach(function (node) {
      observer.observe(node);
    });
  }

  function initAgentDemo() {
    var root = document.querySelector("[data-agent-demo]");
    if (!root) return;

    var thread = root.querySelector("[data-agent-demo-thread]");
    var input = root.querySelector("[data-agent-demo-input]");
    var status = root.querySelector("[data-agent-demo-status]");
    if (!thread || !input || !status) return;

    var reducedMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var scenarios = [
      {
        question: "Почему вчера просела выручка?",
        answer: "Вчера выручка −14% к среднему четверга: 286 400 ₽ против 333 000 ₽. Гостей −18%, средний чек +1%. Главная просадка: ужин 19:00–21:00, минус 42 гостя. Рекомендую точечно поднять загрузку этого слота.",
        metrics: [
          { label: "Выручка", value: "−14%", tone: "is-bad" },
          { label: "Гости", value: "−18%", tone: "is-bad" },
          { label: "Средний чек", value: "+1%", tone: "is-good" },
          { label: "Слот", value: "19:00–21:00", tone: "is-warning" }
        ],
        recommendations: ["Промо 18:30–21:00", "Проверить смену", "Отчёт утром"]
      },
      {
        question: "Что сделать сегодня, чтобы компенсировать?",
        answer: "Компенсировать лучше не общей скидкой, а комбо с высокой маржой: паста + лимонад + десерт. Маржа позиций 63–74%, ожидаемый прирост среднего чека 280–340 ₽.",
        metrics: [
          { label: "Маржа", value: "63–74%", tone: "is-good" },
          { label: "Средний чек", value: "+280–340 ₽", tone: "is-good" },
          { label: "Окно", value: "18:00–21:00", tone: "is-warning" },
          { label: "Скидка", value: "не нужна", tone: "is-good" }
        ],
        recommendations: ["Комбо без скидки", "Запустить сегодня", "Проверить маржу"]
      },
      {
        question: "Где переплачиваем по закупкам?",
        answer: "За 30 дней сильнее всего выросли закупки: моцарелла +12%, томаты +9%, говядина +7%. По моцарелле поставщик Б дешевле на 46 ₽/кг. Потенциальная экономия около 18 400 ₽ в месяц.",
        metrics: [
          { label: "Моцарелла", value: "+12%", tone: "is-bad" },
          { label: "Альтернатива", value: "−46 ₽/кг", tone: "is-good" },
          { label: "Экономия", value: "18 400 ₽/мес", tone: "is-good" },
          { label: "Проверить", value: "3 позиции", tone: "is-warning" }
        ],
        recommendations: ["Сравнить 3 КП", "Переговоры с поставщиком", "Зафиксировать цену"]
      }
    ];

    function createNode(tag, className, text) {
      var node = document.createElement(tag);
      if (className) node.className = className;
      if (typeof text === "string") node.textContent = text;
      return node;
    }

    function scrollThread() {
      thread.scrollTop = thread.scrollHeight;
    }

    function reveal(node) {
      window.requestAnimationFrame(function () {
        node.classList.add("is-visible");
        scrollThread();
      });
    }

    function wait(ms) {
      if (reducedMotion) return Promise.resolve();

      return new Promise(function (resolve) {
        window.setTimeout(resolve, ms);
      });
    }

    function typeText(target, text, speed) {
      if (reducedMotion) {
        target.textContent = text;
        return Promise.resolve();
      }

      return new Promise(function (resolve) {
        var index = 0;

        function tick() {
          index += text.length > 90 ? 2 : 1;
          target.textContent = text.slice(0, index);
          scrollThread();

          if (index >= text.length) {
            resolve();
            return;
          }

          window.setTimeout(tick, speed);
        }

        tick();
      });
    }

    function createMessage(role, author, text) {
      var message = createNode("div", "telegram-message telegram-message-" + role);
      var authorNode = createNode("span", "telegram-author", author);
      var textNode = createNode("div", "telegram-text", text || "");
      var timeNode = createNode("span", "telegram-time", "09:41");

      message.appendChild(authorNode);
      message.appendChild(textNode);
      message.appendChild(timeNode);

      return {
        message: message,
        textNode: textNode,
        timeNode: timeNode
      };
    }

    function createTyping() {
      var typing = createNode("div", "telegram-typing");
      typing.appendChild(createNode("i"));
      typing.appendChild(createNode("i"));
      typing.appendChild(createNode("i"));
      return typing;
    }

    function createMetrics(items) {
      var metrics = createNode("div", "telegram-metrics");

      items.forEach(function (item) {
        var card = createNode("div", "telegram-metric " + item.tone);
        card.appendChild(createNode("span", "", item.label));
        card.appendChild(createNode("strong", "", item.value));
        metrics.appendChild(card);
      });

      return metrics;
    }

    function createRecommendations(items) {
      var list = createNode("div", "telegram-recommendations");

      items.forEach(function (item) {
        list.appendChild(createNode("span", "telegram-recommendation", item));
      });

      return list;
    }

    function renderAgentDetails(messageParts, scenario, visible) {
      var metrics = createMetrics(scenario.metrics);
      var recommendations = createRecommendations(scenario.recommendations);

      messageParts.message.insertBefore(metrics, messageParts.timeNode);
      messageParts.message.insertBefore(recommendations, messageParts.timeNode);

      if (visible) {
        metrics.classList.add("is-visible");
        recommendations.classList.add("is-visible");
      }

      return {
        metrics: metrics,
        recommendations: recommendations
      };
    }

    function renderStatic() {
      var scenario = scenarios[0];
      var user = createMessage("user", "Управляющий", scenario.question);
      var agent = createMessage("agent", "AI Agent", scenario.answer);

      thread.innerHTML = "";
      user.message.classList.add("is-visible");
      agent.message.classList.add("is-visible");
      thread.appendChild(user.message);
      thread.appendChild(agent.message);
      renderAgentDetails(agent, scenario, true);
      input.textContent = "";
      status.textContent = "online";
      scrollThread();
    }

    function playScenario(scenario) {
      var user;
      var agent;
      var typing;
      var details;

      return wait(280)
        .then(function () {
          status.textContent = "online";
          input.textContent = "";
          return typeText(input, scenario.question, 30);
        })
        .then(function () {
          return wait(260);
        })
        .then(function () {
          user = createMessage("user", "Управляющий", scenario.question);
          thread.appendChild(user.message);
          reveal(user.message);
          input.textContent = "";
          return wait(430);
        })
        .then(function () {
          status.textContent = "печатает...";
          typing = createTyping();
          thread.appendChild(typing);
          scrollThread();
          return wait(780);
        })
        .then(function () {
          typing.remove();
          agent = createMessage("agent", "AI Agent", "");
          thread.appendChild(agent.message);
          reveal(agent.message);
          return typeText(agent.textNode, scenario.answer, 12);
        })
        .then(function () {
          details = renderAgentDetails(agent, scenario, false);
          return wait(180);
        })
        .then(function () {
          details.metrics.classList.add("is-visible");
          scrollThread();
          return wait(180);
        })
        .then(function () {
          details.recommendations.classList.add("is-visible");
          status.textContent = "online";
          scrollThread();
          return wait(1650);
        });
    }

    function playLoop() {
      var chain = Promise.resolve();
      thread.innerHTML = "";

      scenarios.forEach(function (scenario) {
        chain = chain.then(function () {
          return playScenario(scenario);
        });
      });

      chain.then(function () {
        return wait(950);
      }).then(playLoop);
    }

    if (reducedMotion) {
      renderStatic();
      return;
    }

    playLoop();
  }

  function showToast(message) {
    if (!toast) {
      window.alert(message);
      return;
    }

    toast.textContent = message;
    toast.hidden = false;
    window.clearTimeout(showToast.timer);
    showToast.timer = window.setTimeout(function () {
      toast.hidden = true;
    }, 6500);
  }

  function initContactForm() {
    var form = document.querySelector("[data-contact-form]");
    if (!form) return;

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      showToast("Спасибо! Заявка пока не отправляется автоматически. Напишите нам в Telegram или на email.");
    });
  }

  window.addEventListener("scroll", setHeaderState, {
    passive: true
  });

  setHeaderState();
  initMobileMenu();
  initSmoothScroll();
  initRoleTabs();
  initFaq();
  initReveal();
  initAgentDemo();
  initContactForm();
})();
