(function () {
  var toast = document.querySelector("[data-toast]");

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

  function initAgentDemo() {
    var root = document.querySelector("[data-agent-demo]");
    if (!root) return;

    var thread = root.querySelector("[data-agent-demo-thread]");
    var input = root.querySelector("[data-agent-demo-input]");
    var status = root.querySelector("[data-agent-demo-status]");
    if (!thread || !input || !status) return;

    var reducedMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var normalStatus = "бот";
    var scenarios = [
      {
        question: "Какая вчера была выручка и почему мало?",
        answer: "Вчера по точке на Мира: 18 787 ₽.\nСреднее за 7 дней: 30 343 ₽. Просадка −38%.\n\nПричины: чеков 35 вместо обычных 51, вечер 18:00–21:00 дал −9 200 ₽, возвратов нет. Я бы проверил график смены и запустил комбо для гостей после 19:00.",
        userTime: "15:35",
        agentTime: "15:38",
        metrics: [
          { label: "Выручка", value: "18 787 ₽", tone: "is-bad" },
          { label: "Просадка", value: "−38%", tone: "is-bad" },
          { label: "Чеки", value: "35", tone: "is-warning" },
          { label: "Следующее", value: "комбо", tone: "is-good" }
        ],
        recommendations: ["Смена 18:00", "Комбо без скидки", "Проверить поток"]
      },
      {
        question: "Что странного в закупках за неделю?",
        answer: "Нашел 3 отклонения: моцарелла +12%, сливки +10%, томаты +9% к средней цене месяца.\n\nПо моцарелле есть поставщик дешевле на 46 ₽/кг. При текущем объеме это около 18 400 ₽ экономии в месяц, но сначала стоит проверить качество партии.",
        userTime: "16:08",
        agentTime: "16:10",
        metrics: [
          { label: "Моцарелла", value: "+12%", tone: "is-bad" },
          { label: "Дешевле", value: "−46 ₽/кг", tone: "is-good" },
          { label: "Экономия", value: "18 400 ₽/мес", tone: "is-good" },
          { label: "Проверить", value: "3 позиции", tone: "is-warning" }
        ],
        recommendations: ["Сравнить КП", "Проверить качество", "Зафиксировать цену"]
      },
      {
        question: "Слабый вторник. Что придумать без скидки?",
        answer: "Лучше не снижать цену на все меню. По данным продаж соберите вечернее комбо: паста + лимонад + десерт.\n\nМаржа по набору 67%, блюда быстро готовятся, а ожидаемый рост среднего чека 280–340 ₽. Могу сразу набросать текст поста для MAX и Telegram.",
        userTime: "17:12",
        agentTime: "17:15",
        metrics: [
          { label: "Маржа", value: "67%", tone: "is-good" },
          { label: "Средний чек", value: "+280–340 ₽", tone: "is-good" },
          { label: "Окно", value: "18:00–21:00", tone: "is-warning" },
          { label: "Креатив", value: "готов", tone: "is-good" }
        ],
        recommendations: ["Комбо", "Текст поста", "Сторис для гостей"]
      },
      {
        question: "Напомни завтра и потом проверяй каждую неделю",
        answer: "Готово. Завтра в 10:00 напомню проверить молочную группу.\n\nДальше каждую пятницу пришлю короткую сводку: где цена выросла, какие позиции выбиваются из нормы и что лучше согласовать с поставщиком.",
        userTime: "18:04",
        agentTime: "18:04",
        metrics: [
          { label: "Задача", value: "создана", tone: "is-good" },
          { label: "Время", value: "10:00", tone: "is-warning" },
          { label: "Регулярно", value: "пятница", tone: "is-good" },
          { label: "Источник", value: "Saby", tone: "is-warning" }
        ],
        recommendations: ["Напоминание", "Рост цен", "Поставщики"]
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

    function addDateChip() {
      thread.appendChild(createNode("div", "max-date-chip", "3 июн."));
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
          index += 1;
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

    function createMessage(role, author, text, time) {
      var message = createNode("div", "telegram-message telegram-message-" + role);
      var authorNode = createNode("span", "telegram-author", author);
      var textNode = createNode("div", "telegram-text", text || "");
      var timeNode = createNode("span", "telegram-time", time || "15:35");

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
      var user = createMessage("user", "Управляющий", scenario.question, scenario.userTime);
      var agent = createMessage("agent", "Ассистент", scenario.answer, scenario.agentTime);

      thread.innerHTML = "";
      addDateChip();
      user.message.classList.add("is-visible");
      agent.message.classList.add("is-visible");
      thread.appendChild(user.message);
      thread.appendChild(agent.message);
      renderAgentDetails(agent, scenario, true);
      input.textContent = "";
      status.textContent = normalStatus;
      scrollThread();
    }

    function playScenario(scenario) {
      var user;
      var agent;
      var typing;
      var details;

      return wait(520)
        .then(function () {
          status.textContent = normalStatus;
          input.textContent = "";
          return typeText(input, scenario.question, 46);
        })
        .then(function () {
          return wait(520);
        })
        .then(function () {
          user = createMessage("user", "Управляющий", scenario.question, scenario.userTime);
          thread.appendChild(user.message);
          reveal(user.message);
          input.textContent = "";
          return wait(650);
        })
        .then(function () {
          status.textContent = "печатает...";
          typing = createTyping();
          thread.appendChild(typing);
          scrollThread();
          return wait(1200);
        })
        .then(function () {
          typing.remove();
          agent = createMessage("agent", "Ассистент", "", scenario.agentTime);
          thread.appendChild(agent.message);
          reveal(agent.message);
          return typeText(agent.textNode, scenario.answer, 23);
        })
        .then(function () {
          details = renderAgentDetails(agent, scenario, false);
          return wait(320);
        })
        .then(function () {
          details.metrics.classList.add("is-visible");
          scrollThread();
          return wait(260);
        })
        .then(function () {
          details.recommendations.classList.add("is-visible");
          status.textContent = normalStatus;
          scrollThread();
          return wait(2600);
        });
    }

    function playLoop() {
      var chain = Promise.resolve();
      thread.innerHTML = "";
      addDateChip();

      scenarios.forEach(function (scenario) {
        chain = chain.then(function () {
          return playScenario(scenario);
        });
      });

      chain.then(function () {
        return wait(1300);
      }).then(playLoop);
    }

    if (reducedMotion) {
      renderStatic();
      return;
    }

    playLoop();
  }

  function initMaxChatDemo() {
    var root = document.querySelector("[data-max-chat-demo]");
    if (!root) return;

    var thread = root.querySelector("[data-max-chat-thread]");
    if (!thread) return;

    var reducedMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var hasStarted = false;
    var scenarios = [
      {
        question: "Какая была вчера выручка?",
        answer: "По iiko вчера: 148 760 ₽. Это −18% к средней среде за 4 недели.\n\nРазбивка: зал 92 400 ₽, доставка 38 900 ₽, самовывоз 17 460 ₽. Чеков 214, гостей 187, средний чек 695 ₽.",
        userTime: "20:37",
        agentTime: "20:38",
        links: ["iiko: Продажи по часам", "iiko: Каналы продаж"]
      },
      {
        question: "В чем проблема, почему просели?",
        answer: "Главная просадка в 18:00-21:00: −28 900 ₽ к норме. Гостей −31, чек почти не упал: 695 ₽ против 712 ₽.\n\nПо iiko видно: доставка −12 заказов, стол 7 простаивал 54 минуты, в смене было 2 официанта вместо 3.",
        userTime: "20:39",
        agentTime: "20:40",
        links: ["iiko: Продажи по часам", "iiko: Смены", "iiko: Доставка"]
      },
      {
        question: "Где переплачиваем?",
        answer: "За 7 дней 3 отклонения по iiko: моцарелла +46 ₽/кг, сливки +18 ₽/л, томаты +27 ₽/кг.\n\nПри текущем объеме это около 18 400 ₽ переплаты в месяц. Первым проверьте поставщика по молочке.",
        userTime: "20:41",
        agentTime: "20:42",
        links: ["iiko: Накладные", "iiko: Цены поставщиков"]
      },
      {
        question: "Слабый вторник. Что сделать?",
        answer: "Не давайте общую скидку. По iiko лучше собрать комбо паста + лимонад + десерт на 18:00-21:00.\n\nМаржа набора 67%, прогноз роста среднего чека +280-340 ₽, плановая добавка к выручке 14 000-17 000 ₽ за вечер.",
        userTime: "20:43",
        agentTime: "20:44",
        links: ["iiko: ABC меню", "iiko: Маржинальность блюд"]
      }
    ];

    function createNode(tag, className, text) {
      var node = document.createElement(tag);
      if (className) node.className = className;
      if (typeof text === "string") node.textContent = text;
      return node;
    }

    function wait(ms) {
      if (reducedMotion) return Promise.resolve();

      return new Promise(function (resolve) {
        window.setTimeout(resolve, ms);
      });
    }

    function scrollThread() {
      thread.scrollTop = thread.scrollHeight;
    }

    function createBubble(role, time) {
      var bubble = createNode("div", "max-chat-bubble max-chat-bubble-" + role);
      var textNode = document.createTextNode("");
      var timeNode = createNode("span", "", time);

      bubble.appendChild(textNode);
      bubble.appendChild(timeNode);

      return {
        bubble: bubble,
        textNode: textNode
      };
    }

    function reveal(node) {
      window.requestAnimationFrame(function () {
        node.classList.add("is-visible");
      });
    }

    function typeText(target, text, speed) {
      if (reducedMotion) {
        target.textContent = text;
        scrollThread();
        return Promise.resolve();
      }

      return new Promise(function (resolve) {
        var index = 0;

        function tick() {
          index += 1;
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

    function addLinks(bubble, links) {
      if (!links || !links.length) return;

      var list = createNode("div", "max-chat-links");
      links.forEach(function (label) {
        list.appendChild(createNode("span", "", label));
      });

      bubble.insertBefore(list, bubble.lastChild);
      scrollThread();
    }

    function trimHistory() {
      var maxItems = 12;
      while (thread.children.length > maxItems) {
        thread.removeChild(thread.children[0]);
      }
      scrollThread();
    }

    function createTyping() {
      var typing = createNode("div", "max-chat-typing");
      typing.appendChild(createNode("i"));
      typing.appendChild(createNode("i"));
      typing.appendChild(createNode("i"));
      return typing;
    }

    function renderStatic() {
      var scenario = scenarios[0];
      var user = createBubble("user", scenario.userTime);
      var agent = createBubble("agent", scenario.agentTime);

      thread.innerHTML = "";
      user.textNode.textContent = scenario.question;
      agent.textNode.textContent = scenario.answer;
      addLinks(agent.bubble, scenario.links);
      user.bubble.classList.add("is-visible");
      agent.bubble.classList.add("is-visible");
      thread.appendChild(user.bubble);
      thread.appendChild(agent.bubble);
    }

    function playScenario(scenario) {
      var user = createBubble("user", scenario.userTime);
      var agent = createBubble("agent", scenario.agentTime);
      var typing;

      thread.appendChild(user.bubble);
      reveal(user.bubble);
      scrollThread();

      return typeText(user.textNode, scenario.question, 34)
        .then(function () {
          return wait(520);
        })
        .then(function () {
          typing = createTyping();
          thread.appendChild(typing);
          scrollThread();
          return wait(820);
        })
        .then(function () {
          typing.remove();
          thread.appendChild(agent.bubble);
          reveal(agent.bubble);
          scrollThread();
          return typeText(agent.textNode, scenario.answer, 15);
        })
        .then(function () {
          addLinks(agent.bubble, scenario.links);
          trimHistory();
          return wait(280);
        })
        .then(function () {
          return wait(1800);
        });
    }

    function playLoop() {
      var chain = Promise.resolve();
      if (!hasStarted) {
        thread.innerHTML = "";
        hasStarted = true;
      }

      scenarios.forEach(function (scenario) {
        chain = chain.then(function () {
          return playScenario(scenario);
        });
      });

      chain.then(function () {
        return wait(500);
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
      showToast("Форма пока не отправляет заявку. Напишите на email или в удобный мессенджер.");
    });
  }

  initSmoothScroll();
  initAgentDemo();
  initMaxChatDemo();
  initContactForm();
})();
