(function (global) {
  "use strict";

  var doc = global.document;
  if (!doc || global.Ykcx) return;

  var STYLE_ID = "ykcx-style";
  var DEFAULT_OPTIONS = {
    mode: "dock",
    longPressDelay: 520,
    mouseLongPress: true,
    copyText: "复制",
    selectAllText: "全选",
    keyboardHeight: 300,
    floatingWidth: 720,
    floatingScale: 1,
    zIndex: 2147483000
  };

  var ENGLISH_ROWS = [
    ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
    ["a", "s", "d", "f", "g", "h", "j", "k", "l"],
    ["shift", "z", "x", "c", "v", "b", "n", "m", "backspace"],
    ["symbols", "language", "comma", "space", "period", "enter"]
  ];

  var SYMBOL_ROWS = [
    ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"],
    ["@", "#", "$", "_", "&", "-", "+", "(", ")", "/"],
    ["more", "*", "\"", "'", ":", ";", "!", "?", "backspace"],
    ["letters", "language", "comma", "space", "period", "enter"]
  ];

  var MORE_SYMBOL_ROWS = [
    ["~", "`", "|", "•", "√", "π", "÷", "×", "¶", "∆"],
    ["£", "¢", "€", "¥", "^", "°", "=", "{", "}", "\\"],
    ["symbols", "%", "©", "®", "™", "✓", "[", "]", "backspace"],
    ["letters", "language", "comma", "space", "period", "enter"]
  ];

  // Material Icons Outlined paths from google/material-design-icons.
  var MATERIAL_ICONS = {
    language: "M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zm6.93 6h-2.95c-.32-1.25-.78-2.45-1.38-3.56 1.84.63 3.37 1.91 4.33 3.56zM12 4.04c.83 1.2 1.48 2.53 1.91 3.96h-3.82c.43-1.43 1.08-2.76 1.91-3.96zM4.26 14C4.1 13.36 4 12.69 4 12s.1-1.36.26-2h3.38c-.08.66-.14 1.32-.14 2s.06 1.34.14 2H4.26zm.82 2h2.95c.32 1.25.78 2.45 1.38 3.56-1.84-.63-3.37-1.9-4.33-3.56zm2.95-8H5.08c.96-1.66 2.49-2.93 4.33-3.56C8.81 5.55 8.35 6.75 8.03 8zM12 19.96c-.83-1.2-1.48-2.53-1.91-3.96h3.82c-.43 1.43-1.08 2.76-1.91 3.96zM14.34 14H9.66c-.09-.66-.16-1.32-.16-2s.07-1.35.16-2h4.68c.09.65.16 1.32.16 2s-.07 1.34-.16 2zm.25 5.56c.6-1.11 1.06-2.31 1.38-3.56h2.95c-.96 1.65-2.49 2.93-4.33 3.56zM16.36 14c.08-.66.14-1.32.14-2s-.06-1.34-.14-2h3.38c.16.64.26 1.31.26 2s-.1 1.36-.26 2h-3.38z",
    keyboard_backspace: "M21 11H6.83l3.58-3.59L9 6l-6 6 6 6 1.41-1.41L6.83 13H21v-2z",
    keyboard_capslock: "M12 8.41L16.59 13 18 11.59l-6-6-6 6L7.41 13 12 8.41zM6 18h12v-2H6v2z",
    keyboard_return: "M19 7v4H5.83l3.58-3.59L8 6l-6 6 6 6 1.41-1.41L5.83 13H21V7h-2z",
    keyboard_arrow_down: "M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z",
    open_with: "M10 9h4V6h3l-5-5-5 5h3v3zm-1 1H6V7l-5 5 5 5v-3h3v-4zm14 2l-5-5v3h-3v4h3v3l5-5zm-9 3h-4v3H7l5 5 5-5h-3v-3z",
    picture_in_picture_alt: "M19 11h-8v6h8v-6zm-2 4h-4v-2h4v2zm4-12H3c-1.1 0-2 .88-2 1.98V19c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V4.98C23 3.88 22.1 3 21 3zm0 16.02H3V4.97h18v14.05z",
    vertical_align_bottom: "M16 13h-3V3h-2v10H8l4 4 4-4zM4 19v2h16v-2H4z"
  };

  function assign(target) {
    for (var i = 1; i < arguments.length; i += 1) {
      var source = arguments[i] || {};
      Object.keys(source).forEach(function (key) { target[key] = source[key]; });
    }
    return target;
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function create(tag, className, text) {
    var element = doc.createElement(tag);
    if (className) element.className = className;
    if (text != null) element.textContent = text;
    return element;
  }

  function materialIcon(name) {
    var svg = doc.createElementNS("http://www.w3.org/2000/svg", "svg");
    var path = doc.createElementNS("http://www.w3.org/2000/svg", "path");
    svg.setAttribute("class", "ykcx-material-icon");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("aria-hidden", "true");
    svg.setAttribute("focusable", "false");
    path.setAttribute("d", MATERIAL_ICONS[name]);
    svg.appendChild(path);
    return svg;
  }

  function setMaterialIcon(element, name) {
    while (element.firstChild) element.removeChild(element.firstChild);
    element.appendChild(materialIcon(name));
  }

  function safeFocus(element) {
    try { element.focus({ preventScroll: true }); }
    catch (error) { element.focus(); }
  }

  function isEditable(element) {
    if (!element || element.disabled || element.readOnly) return false;
    var tag = element.tagName && element.tagName.toLowerCase();
    if (tag === "textarea") return true;
    if (tag === "input") {
      return !/^(button|checkbox|color|file|hidden|image|radio|range|reset|submit)$/i.test(element.type || "text");
    }
    return !!element.isContentEditable;
  }

  function closestEditable(element) {
    while (element && element !== doc.body) {
      if (isEditable(element)) return element;
      element = element.parentElement;
    }
    return null;
  }

  function dispatchInput(element, inputType, data) {
    var event;
    try {
      event = new InputEvent("input", { bubbles: true, inputType: inputType, data: data == null ? null : data });
    } catch (error) {
      event = doc.createEvent("Event");
      event.initEvent("input", true, false);
      event.inputType = inputType;
      event.data = data == null ? null : data;
    }
    element.dispatchEvent(event);
  }

  function TextAdapter() {
    this.element = null;
    this.range = null;
  }

  TextAdapter.prototype.attach = function (element) {
    this.element = element;
    this.range = null;
    if (element && element.isContentEditable) this.captureRange();
  };

  TextAdapter.prototype.captureRange = function () {
    if (!this.element || !this.element.isContentEditable) return;
    var selection = global.getSelection && global.getSelection();
    if (selection && selection.rangeCount) {
      var range = selection.getRangeAt(0);
      if (this.element.contains(range.commonAncestorContainer)) this.range = range.cloneRange();
    }
  };

  TextAdapter.prototype.restoreRange = function () {
    if (!this.range) return null;
    var selection = global.getSelection();
    selection.removeAllRanges();
    selection.addRange(this.range);
    return this.range;
  };

  TextAdapter.prototype.getSelection = function () {
    var element = this.element;
    if (!element) return { start: 0, end: 0, text: "" };
    if (!element.isContentEditable) {
      var start = element.selectionStart == null ? element.value.length : element.selectionStart;
      var end = element.selectionEnd == null ? start : element.selectionEnd;
      return { start: start, end: end, text: element.value.slice(start, end) };
    }
    var selection = global.getSelection();
    return { start: 0, end: 0, text: selection ? selection.toString() : "" };
  };

  TextAdapter.prototype.replaceSelection = function (text, inputType) {
    var element = this.element;
    if (!element) return;
    if (!element.isContentEditable) {
      var start = element.selectionStart == null ? element.value.length : element.selectionStart;
      var end = element.selectionEnd == null ? start : element.selectionEnd;
      var scrollTop = element.scrollTop;
      element.value = element.value.slice(0, start) + text + element.value.slice(end);
      element.setSelectionRange(start + text.length, start + text.length);
      element.scrollTop = scrollTop;
      dispatchInput(element, inputType || "insertText", text);
      return;
    }
    var range = this.restoreRange();
    if (!range) {
      range = doc.createRange();
      range.selectNodeContents(element);
      range.collapse(false);
    }
    range.deleteContents();
    var node = doc.createTextNode(text);
    range.insertNode(node);
    range.setStartAfter(node);
    range.collapse(true);
    this.range = range.cloneRange();
    this.restoreRange();
    dispatchInput(element, inputType || "insertText", text);
  };

  TextAdapter.prototype.backspace = function () {
    var element = this.element;
    if (!element) return;
    if (!element.isContentEditable) {
      var start = element.selectionStart == null ? element.value.length : element.selectionStart;
      var end = element.selectionEnd == null ? start : element.selectionEnd;
      if (start === end && start > 0) start -= Array.from(element.value.slice(0, start)).pop().length;
      element.value = element.value.slice(0, start) + element.value.slice(end);
      element.setSelectionRange(start, start);
      dispatchInput(element, "deleteContentBackward", null);
      return;
    }
    var range = this.restoreRange();
    if (!range) return;
    if (range.collapsed) {
      if (range.startContainer.nodeType === 3 && range.startOffset > 0) {
        range.setStart(range.startContainer, range.startOffset - 1);
      } else {
        return;
      }
    }
    range.deleteContents();
    this.range = range.cloneRange();
    this.restoreRange();
    dispatchInput(element, "deleteContentBackward", null);
  };

  TextAdapter.prototype.selectAll = function () {
    var element = this.element;
    if (!element) return;
    if (!element.isContentEditable) {
      element.setSelectionRange(0, element.value.length);
      return;
    }
    var range = doc.createRange();
    range.selectNodeContents(element);
    var selection = global.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
    this.range = range.cloneRange();
  };

  function Keyboard(options, adapter, api) {
    this.options = options;
    this.adapter = adapter;
    this.api = api;
    this.visible = false;
    this.shift = false;
    this.capsLock = false;
    this.page = "letters";
    this.languages = [];
    this.languageIndex = 0;
    this.drag = null;
    this.repeatTimer = null;
    this.build();
  }

  Keyboard.prototype.build = function () {
    this.root = create("div", "ykcx-keyboard ykcx-mode-" + this.options.mode);
    this.root.setAttribute("role", "application");
    this.root.setAttribute("aria-label", "屏幕键盘");
    this.root.style.setProperty("--ykcx-z", this.options.zIndex);
    this.root.style.setProperty("--ykcx-height", this.options.keyboardHeight + "px");
    this.root.style.setProperty("--ykcx-float-width", this.options.floatingWidth + "px");
    this.root.style.setProperty("--ykcx-scale", this.options.floatingScale);

    this.header = create("div", "ykcx-keyboard-header");
    this.dragHandle = create("button", "ykcx-drag-handle");
    setMaterialIcon(this.dragHandle, "open_with");
    this.dragHandle.type = "button";
    this.dragHandle.title = "拖动键盘";
    this.candidates = create("div", "ykcx-candidates");
    this.tools = create("div", "ykcx-tools");
    this.modeButton = this.toolButton("ykcx-mode-button", "picture_in_picture_alt", "切换为悬浮键盘");
    this.hideButton = this.toolButton("", "keyboard_arrow_down", "隐藏键盘");
    this.tools.appendChild(this.modeButton);
    this.tools.appendChild(this.hideButton);
    this.header.appendChild(this.dragHandle);
    this.header.appendChild(this.candidates);
    this.header.appendChild(this.tools);

    this.composition = create("div", "ykcx-composition");
    this.keys = create("div", "ykcx-keys");
    this.root.appendChild(this.header);
    this.root.appendChild(this.composition);
    this.root.appendChild(this.keys);
    doc.body.appendChild(this.root);

    this.bindEvents();
    this.render();
  };

  Keyboard.prototype.toolButton = function (className, iconName, title) {
    var button = create("button", "ykcx-tool-button " + className);
    setMaterialIcon(button, iconName);
    button.type = "button";
    button.title = title;
    button.setAttribute("aria-label", title);
    return button;
  };

  Keyboard.prototype.bindEvents = function () {
    var self = this;
    this.root.addEventListener("pointerdown", function (event) {
      self.adapter.captureRange();
      event.preventDefault();
      var key = event.target.closest && event.target.closest(".ykcx-key");
      if (key && key.dataset.key === "backspace") {
        self.pressKey("backspace");
        self.repeatTimer = global.setTimeout(function repeat() {
          self.pressKey("backspace");
          self.repeatTimer = global.setTimeout(repeat, 55);
        }, 420);
      }
    });
    this.root.addEventListener("pointerup", function (event) {
      self.stopRepeat();
      var key = event.target.closest && event.target.closest(".ykcx-key");
      if (key && key.dataset.key !== "backspace") self.pressKey(key.dataset.key);
    });
    this.root.addEventListener("pointercancel", function () { self.stopRepeat(); });
    this.modeButton.addEventListener("click", function () { self.setMode(self.options.mode === "dock" ? "floating" : "dock"); });
    this.hideButton.addEventListener("click", function () { self.hide(); });
    this.bindDrag();
  };

  Keyboard.prototype.bindDrag = function () {
    var self = this;
    this.dragHandle.addEventListener("pointerdown", function (event) {
      if (self.options.mode !== "floating") return;
      event.preventDefault();
      self.dragHandle.setPointerCapture(event.pointerId);
      var rect = self.root.getBoundingClientRect();
      self.drag = { pointerId: event.pointerId, dx: event.clientX - rect.left, dy: event.clientY - rect.top };
    });
    this.dragHandle.addEventListener("pointermove", function (event) {
      if (!self.drag || self.drag.pointerId !== event.pointerId) return;
      var rect = self.root.getBoundingClientRect();
      var left = clamp(event.clientX - self.drag.dx, 8, global.innerWidth - rect.width - 8);
      var top = clamp(event.clientY - self.drag.dy, 8, global.innerHeight - rect.height - 8);
      self.root.style.left = left + "px";
      self.root.style.top = top + "px";
      self.root.style.right = "auto";
      self.root.style.bottom = "auto";
    });
    this.dragHandle.addEventListener("pointerup", function (event) {
      if (self.drag && self.drag.pointerId === event.pointerId) self.drag = null;
    });
  };

  Keyboard.prototype.stopRepeat = function () {
    global.clearTimeout(this.repeatTimer);
    this.repeatTimer = null;
  };

  Keyboard.prototype.registerLanguage = function (language) {
    if (!language || !language.id || typeof language.onKey !== "function") throw new Error("Ykcx language plugin is invalid");
    for (var i = 0; i < this.languages.length; i += 1) {
      if (this.languages[i].id === language.id) return;
    }
    this.languages.push(language);
    if (typeof language.init === "function") language.init(this.pluginContext());
    this.render();
  };

  Keyboard.prototype.pluginContext = function () {
    var self = this;
    return {
      insertText: function (text) { self.adapter.replaceSelection(text, "insertText"); },
      backspace: function () { self.adapter.backspace(); },
      setCandidates: function (items, onSelect) { self.setCandidates(items, onSelect); },
      setComposition: function (text) { self.setComposition(text); },
      refresh: function () { self.render(); },
      getTarget: function () { return self.adapter.element; }
    };
  };

  Keyboard.prototype.activeLanguage = function () {
    return this.languageIndex === 0 ? null : this.languages[this.languageIndex - 1];
  };

  Keyboard.prototype.cycleLanguage = function () {
    var current = this.activeLanguage();
    if (current && typeof current.commit === "function") current.commit(this.pluginContext());
    this.languageIndex = (this.languageIndex + 1) % (this.languages.length + 1);
    var next = this.activeLanguage();
    if (next && typeof next.activate === "function") next.activate(this.pluginContext());
    this.render();
    this.api.emit("languagechange", { id: next ? next.id : "en", label: next ? next.label : "English" });
  };

  Keyboard.prototype.rows = function () {
    if (this.page === "symbols") return SYMBOL_ROWS;
    if (this.page === "more") return MORE_SYMBOL_ROWS;
    return ENGLISH_ROWS;
  };

  Keyboard.prototype.render = function () {
    var self = this;
    this.keys.innerHTML = "";
    this.rows().forEach(function (row, rowIndex) {
      var rowElement = create("div", "ykcx-key-row ykcx-row-" + rowIndex);
      row.forEach(function (key) {
        var button = create("button", self.keyClass(key));
        var icon = self.keyIcon(key);
        if (icon) setMaterialIcon(button, icon);
        else button.textContent = self.keyLabel(key);
        button.type = "button";
        button.dataset.key = key;
        button.setAttribute("aria-label", self.keyAriaLabel(key));
        rowElement.appendChild(button);
      });
      self.keys.appendChild(rowElement);
    });
    var language = this.activeLanguage();
    this.root.dataset.language = language ? language.id : "en";
    this.root.classList.toggle("ykcx-has-languages", this.languages.length > 0);
    this.dragHandle.hidden = this.options.mode !== "floating";
    this.renderModeButton();
  };

  Keyboard.prototype.renderModeButton = function () {
    var floating = this.options.mode === "floating";
    setMaterialIcon(this.modeButton, floating ? "vertical_align_bottom" : "picture_in_picture_alt");
    this.modeButton.title = floating ? "切换为吸底键盘" : "切换为悬浮键盘";
    this.modeButton.setAttribute("aria-label", this.modeButton.title);
  };

  Keyboard.prototype.keyClass = function (key) {
    var special = /^(shift|backspace|symbols|more|letters|language|enter|space|comma|period)$/.test(key);
    var className = "ykcx-key" + (special ? " ykcx-key-special" : "");
    if (key === "space") className += " ykcx-key-space";
    if (key === "enter") className += " ykcx-key-enter";
    if (key === "shift" && (this.shift || this.capsLock)) className += " ykcx-key-active";
    return className;
  };

  Keyboard.prototype.keyLabel = function (key) {
    var labels = {
      symbols: "?123", more: "=\\<", letters: "ABC", comma: ",", period: "."
    };
    if (key === "space") {
      var language = this.activeLanguage();
      return language ? language.label : "English";
    }
    if (labels[key]) return labels[key];
    return this.shift || this.capsLock ? key.toUpperCase() : key;
  };

  Keyboard.prototype.keyIcon = function (key) {
    var icons = {
      shift: "keyboard_capslock",
      backspace: "keyboard_backspace",
      language: "language",
      enter: "keyboard_return"
    };
    return icons[key] || null;
  };

  Keyboard.prototype.keyAriaLabel = function (key) {
    var labels = { shift: "大写", backspace: "退格", symbols: "符号", more: "更多符号", letters: "字母", language: "切换语言", space: "空格", enter: "回车" };
    return labels[key] || key;
  };

  Keyboard.prototype.pressKey = function (key) {
    var language = this.activeLanguage();
    if (key === "language") {
      if (this.languages.length) this.cycleLanguage();
      return;
    }
    if (key === "shift") {
      var now = Date.now();
      if (this.lastShift && now - this.lastShift < 360) this.capsLock = !this.capsLock;
      this.shift = !this.shift;
      this.lastShift = now;
      this.render();
      return;
    }
    if (key === "symbols" || key === "more" || key === "letters") {
      this.page = key === "letters" ? "letters" : key;
      this.render();
      return;
    }
    if (language && this.page === "letters" && language.onKey(key, this.pluginContext()) !== false) return;
    if (key === "backspace") this.adapter.backspace();
    else if (key === "space") this.adapter.replaceSelection(" ", "insertText");
    else if (key === "enter") this.adapter.replaceSelection("\n", "insertLineBreak");
    else if (key === "comma") this.adapter.replaceSelection(",", "insertText");
    else if (key === "period") this.adapter.replaceSelection(".", "insertText");
    else {
      this.adapter.replaceSelection(this.shift || this.capsLock ? key.toUpperCase() : key, "insertText");
      if (this.shift && !this.capsLock) { this.shift = false; this.render(); }
    }
  };

  Keyboard.prototype.setCandidates = function (items, onSelect) {
    var self = this;
    this.candidates.innerHTML = "";
    (items || []).forEach(function (item, index) {
      var button = create("button", "ykcx-candidate", item);
      button.type = "button";
      button.addEventListener("pointerdown", function (event) { event.preventDefault(); });
      button.addEventListener("click", function () { onSelect(item, index); });
      self.candidates.appendChild(button);
    });
  };

  Keyboard.prototype.setComposition = function (text) {
    this.composition.textContent = text || "";
    this.composition.classList.toggle("ykcx-composition-visible", !!text);
  };

  Keyboard.prototype.show = function (element) {
    this.adapter.attach(element);
    this.visible = true;
    this.root.classList.add("ykcx-visible");
    doc.documentElement.classList.toggle("ykcx-dock-open", this.options.mode === "dock");
    doc.documentElement.style.setProperty("--ykcx-safe-bottom", this.options.keyboardHeight + "px");
    this.api.emit("show", { target: element });
    global.setTimeout(function () { safeFocus(element); }, 0);
  };

  Keyboard.prototype.hide = function () {
    var language = this.activeLanguage();
    if (language && typeof language.commit === "function") language.commit(this.pluginContext());
    this.visible = false;
    this.root.classList.remove("ykcx-visible");
    doc.documentElement.classList.remove("ykcx-dock-open");
    this.api.emit("hide", { target: this.adapter.element });
  };

  Keyboard.prototype.setMode = function (mode) {
    if (mode !== "dock" && mode !== "floating") throw new Error("Ykcx mode must be 'dock' or 'floating'");
    this.options.mode = mode;
    this.root.classList.toggle("ykcx-mode-dock", mode === "dock");
    this.root.classList.toggle("ykcx-mode-floating", mode === "floating");
    this.root.style.left = "";
    this.root.style.top = "";
    this.root.style.right = "";
    this.root.style.bottom = "";
    this.dragHandle.hidden = mode !== "floating";
    this.renderModeButton();
    doc.documentElement.classList.toggle("ykcx-dock-open", this.visible && mode === "dock");
    this.api.emit("modechange", { mode: mode });
  };

  function SelectionController(options, adapter, api) {
    this.options = options;
    this.adapter = adapter;
    this.api = api;
    this.timer = null;
    this.startPoint = null;
    this.activeTarget = null;
    this.range = null;
    this.activatedPointerId = null;
    this.draggingHandle = null;
    this.build();
    this.bind();
  }

  SelectionController.prototype.build = function () {
    this.overlay = create("div", "ykcx-selection-overlay");
    this.overlay.style.setProperty("--ykcx-z", this.options.zIndex + 20);
    this.menu = create("div", "ykcx-selection-menu");
    this.copyButton = create("button", "ykcx-selection-action", this.options.copyText);
    this.selectAllButton = create("button", "ykcx-selection-action", this.options.selectAllText);
    this.startHandle = create("div", "ykcx-selection-handle ykcx-selection-handle-start");
    this.endHandle = create("div", "ykcx-selection-handle ykcx-selection-handle-end");
    this.menu.appendChild(this.copyButton);
    this.menu.appendChild(this.selectAllButton);
    this.overlay.appendChild(this.menu);
    this.overlay.appendChild(this.startHandle);
    this.overlay.appendChild(this.endHandle);
    doc.body.appendChild(this.overlay);
  };

  SelectionController.prototype.bind = function () {
    var self = this;
    doc.addEventListener("pointerdown", function (event) {
      if (event.target.closest && (event.target.closest(".ykcx-keyboard") || event.target.closest(".ykcx-selection-overlay"))) return;
      if (event.pointerType === "mouse" && !self.options.mouseLongPress) return;
      self.startPoint = { x: event.clientX, y: event.clientY, pointerId: event.pointerId };
      self.timer = global.setTimeout(function () { self.activate(event.target, self.startPoint.x, self.startPoint.y); }, self.options.longPressDelay);
    }, true);
    doc.addEventListener("pointermove", function (event) {
      if (!self.startPoint || event.pointerId !== self.startPoint.pointerId) return;
      if (Math.hypot(event.clientX - self.startPoint.x, event.clientY - self.startPoint.y) > 10) self.cancelTimer();
    }, true);
    doc.addEventListener("pointerup", function (event) {
      if (self.activatedPointerId === event.pointerId) {
        event.preventDefault();
        self.activatedPointerId = null;
        global.setTimeout(function () { self.restoreDomRange(); self.position(); }, 0);
      }
      self.cancelTimer();
    }, true);
    doc.addEventListener("pointercancel", function () { self.cancelTimer(); }, true);
    doc.addEventListener("scroll", function () { if (self.overlay.classList.contains("ykcx-selection-visible")) self.position(); }, true);
    global.addEventListener("resize", function () { self.position(); });
    this.copyButton.addEventListener("click", function () { self.copy(); });
    this.selectAllButton.addEventListener("click", function () { self.selectAll(); });
    this.bindHandle(this.startHandle, "start");
    this.bindHandle(this.endHandle, "end");
  };

  SelectionController.prototype.cancelTimer = function () {
    global.clearTimeout(this.timer);
    this.timer = null;
    this.startPoint = null;
  };

  SelectionController.prototype.caretRangeFromPoint = function (x, y) {
    if (doc.caretRangeFromPoint) return doc.caretRangeFromPoint(x, y);
    if (doc.caretPositionFromPoint) {
      var position = doc.caretPositionFromPoint(x, y);
      if (!position) return null;
      var range = doc.createRange();
      range.setStart(position.offsetNode, position.offset);
      range.collapse(true);
      return range;
    }
    return null;
  };

  SelectionController.prototype.wordBounds = function (text, offset) {
    var isWord = function (char) {
      return /[A-Za-z0-9_]/.test(char) || (char && char.charCodeAt(0) > 127 && !/[\s，。！？、；：“”‘’（）【】《》]/.test(char));
    };
    var start = clamp(offset, 0, text.length);
    var end = start;
    while (start > 0 && isWord(text.charAt(start - 1))) start -= 1;
    while (end < text.length && isWord(text.charAt(end))) end += 1;
    if (start === end && text.length) { start = Math.min(offset, text.length - 1); end = start + 1; }
    return { start: start, end: end };
  };

  SelectionController.prototype.activate = function (target, x, y) {
    this.activatedPointerId = this.startPoint && this.startPoint.pointerId;
    this.cancelTimer();
    this.activeTarget = closestEditable(target) || target;
    var editable = closestEditable(target);
    if (editable && !editable.isContentEditable) {
      safeFocus(editable);
      var position = this.inputOffsetFromPoint(editable, x, y);
      var bounds = this.wordBounds(editable.value, position);
      editable.setSelectionRange(bounds.start, bounds.end);
      this.adapter.attach(editable);
    } else {
      var pointRange = this.caretRangeFromPoint(x, y);
      if (!pointRange || !pointRange.startContainer || pointRange.startContainer.nodeType !== 3) return;
      var text = pointRange.startContainer.nodeValue || "";
      var word = this.wordBounds(text, pointRange.startOffset);
      pointRange.setStart(pointRange.startContainer, word.start);
      pointRange.setEnd(pointRange.startContainer, word.end);
      var selection = global.getSelection();
      selection.removeAllRanges();
      selection.addRange(pointRange);
      this.range = pointRange.cloneRange();
      if (editable) { this.adapter.attach(editable); this.adapter.range = pointRange.cloneRange(); }
    }
    this.overlay.classList.add("ykcx-selection-visible");
    this.position();
    if (global.navigator.vibrate) global.navigator.vibrate(18);
    this.api.emit("selectionshow", { target: this.activeTarget });
  };

  SelectionController.prototype.restoreDomRange = function () {
    if (!this.range) return;
    var editable = closestEditable(this.activeTarget);
    if (editable && !editable.isContentEditable) return;
    var selection = global.getSelection();
    if (!selection) return;
    selection.removeAllRanges();
    selection.addRange(this.range.cloneRange());
  };

  SelectionController.prototype.inputOffsetFromPoint = function (element, x) {
    var rect = element.getBoundingClientRect();
    var style = global.getComputedStyle(element);
    var probe = create("canvas");
    var context = probe.getContext("2d");
    context.font = style.font;
    var localX = x - rect.left - parseFloat(style.paddingLeft || 0) + element.scrollLeft;
    var value = element.value || "";
    var best = value.length;
    for (var i = 0; i <= value.length; i += 1) {
      if (context.measureText(value.slice(0, i)).width >= localX) { best = i; break; }
    }
    return best;
  };

  SelectionController.prototype.selectionRects = function () {
    var element = closestEditable(this.activeTarget);
    if (element && !element.isContentEditable) return this.inputSelectionRects(element);
    var selection = global.getSelection();
    if (!selection || !selection.rangeCount) return null;
    var range = selection.getRangeAt(0);
    var rects = range.getClientRects();
    if (!rects.length) return null;
    return { start: rects[0], end: rects[rects.length - 1], union: range.getBoundingClientRect() };
  };

  SelectionController.prototype.inputSelectionRects = function (element) {
    var rect = element.getBoundingClientRect();
    var style = global.getComputedStyle(element);
    var canvas = create("canvas");
    var context = canvas.getContext("2d");
    context.font = style.font;
    var startWidth = context.measureText(element.value.slice(0, element.selectionStart)).width;
    var selectionWidth = Math.max(2, context.measureText(element.value.slice(element.selectionStart, element.selectionEnd)).width);
    var left = rect.left + parseFloat(style.paddingLeft || 0) + startWidth - element.scrollLeft;
    var top = rect.top + parseFloat(style.paddingTop || 0);
    var height = parseFloat(style.lineHeight) || parseFloat(style.fontSize) * 1.25;
    this.paintInputHighlight(element, left, top, selectionWidth, height);
    return {
      start: { left: left, right: left, top: top, bottom: top + height, width: 0, height: height },
      end: { left: left + selectionWidth, right: left + selectionWidth, top: top, bottom: top + height, width: 0, height: height },
      union: { left: left, right: left + selectionWidth, top: top, bottom: top + height, width: selectionWidth, height: height }
    };
  };

  SelectionController.prototype.paintInputHighlight = function (element, left, top, width, height) {
    if (!this.highlight) {
      this.highlight = create("div", "ykcx-input-highlight");
      this.overlay.insertBefore(this.highlight, this.menu);
    }
    var rect = element.getBoundingClientRect();
    this.highlight.style.left = clamp(left, rect.left, rect.right) + "px";
    this.highlight.style.top = top + "px";
    this.highlight.style.width = clamp(width, 2, Math.max(2, rect.right - left)) + "px";
    this.highlight.style.height = height + "px";
  };

  SelectionController.prototype.position = function () {
    if (!this.overlay.classList.contains("ykcx-selection-visible")) return;
    var rects = this.selectionRects();
    if (!rects) return this.hide();
    this.startHandle.style.left = rects.start.left + "px";
    this.startHandle.style.top = rects.start.bottom + "px";
    this.endHandle.style.left = rects.end.right + "px";
    this.endHandle.style.top = rects.end.bottom + "px";
    var menuWidth = this.menu.offsetWidth || 126;
    var left = clamp(rects.union.left + rects.union.width / 2 - menuWidth / 2, 8, global.innerWidth - menuWidth - 8);
    var top = rects.union.top - (this.menu.offsetHeight || 46) - 12;
    if (top < 8) top = rects.union.bottom + 30;
    this.menu.style.left = left + "px";
    this.menu.style.top = top + "px";
  };

  SelectionController.prototype.bindHandle = function (handle, edge) {
    var self = this;
    handle.addEventListener("pointerdown", function (event) {
      event.preventDefault();
      handle.setPointerCapture(event.pointerId);
      self.draggingHandle = edge;
    });
    handle.addEventListener("pointermove", function (event) {
      if (self.draggingHandle !== edge) return;
      self.moveHandle(edge, event.clientX, event.clientY - 14);
    });
    handle.addEventListener("pointerup", function () { self.draggingHandle = null; });
  };

  SelectionController.prototype.moveHandle = function (edge, x, y) {
    var element = closestEditable(this.activeTarget);
    if (element && !element.isContentEditable) {
      var offset = this.inputOffsetFromPoint(element, x);
      var start = element.selectionStart;
      var end = element.selectionEnd;
      if (edge === "start") start = Math.min(offset, end - 1);
      else end = Math.max(offset, start + 1);
      element.setSelectionRange(start, end);
    } else {
      var point = this.caretRangeFromPoint(x, y);
      var selection = global.getSelection();
      if (!point || !selection || !selection.rangeCount) return;
      var current = selection.getRangeAt(0).cloneRange();
      try {
        if (edge === "start") current.setStart(point.startContainer, point.startOffset);
        else current.setEnd(point.startContainer, point.startOffset);
        selection.removeAllRanges();
        selection.addRange(current);
        this.range = current.cloneRange();
      } catch (error) { return; }
    }
    this.position();
  };

  SelectionController.prototype.selectedText = function () {
    var element = closestEditable(this.activeTarget);
    if (element && !element.isContentEditable) return element.value.slice(element.selectionStart, element.selectionEnd);
    var selection = global.getSelection();
    return selection ? selection.toString() : "";
  };

  SelectionController.prototype.copy = function () {
    var self = this;
    var text = this.selectedText();
    if (!text) return;
    var done = function () { self.api.emit("copy", { text: text }); self.hide(); };
    if (global.navigator.clipboard && global.navigator.clipboard.writeText) {
      global.navigator.clipboard.writeText(text).then(done, function () { self.legacyCopy(text); done(); });
    } else {
      this.legacyCopy(text);
      done();
    }
  };

  SelectionController.prototype.legacyCopy = function (text) {
    var textarea = create("textarea", "ykcx-copy-helper");
    textarea.value = text;
    doc.body.appendChild(textarea);
    textarea.select();
    try { doc.execCommand("copy"); } catch (error) { /* Host clipboard policy may reject copying. */ }
    textarea.remove();
  };

  SelectionController.prototype.selectAll = function () {
    var editable = closestEditable(this.activeTarget);
    if (editable) {
      this.adapter.attach(editable);
      this.adapter.selectAll();
    } else {
      var range = doc.createRange();
      range.selectNodeContents(this.activeTarget);
      var selection = global.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
      this.range = range.cloneRange();
    }
    this.position();
  };

  SelectionController.prototype.hide = function () {
    this.overlay.classList.remove("ykcx-selection-visible");
    if (this.highlight) this.highlight.removeAttribute("style");
    this.api.emit("selectionhide", { target: this.activeTarget });
  };

  function injectStyle() {
    if (doc.getElementById(STYLE_ID)) return;
    var style = create("style");
    style.id = STYLE_ID;
    style.textContent = [
      ":root{--ykcx-blue:#1a73e8;--ykcx-key-bg:#f8fafc;--ykcx-panel:#e8edf2;--ykcx-ink:#17212b}",
      "html.ykcx-dock-open{padding-bottom:var(--ykcx-safe-bottom)!important;box-sizing:border-box}",
      ".ykcx-keyboard,.ykcx-keyboard *{box-sizing:border-box;-webkit-tap-highlight-color:transparent;user-select:none;font-family:Roboto,Arial,sans-serif}",
      ".ykcx-keyboard{position:fixed;display:none;z-index:var(--ykcx-z);background:var(--ykcx-panel);color:var(--ykcx-ink);touch-action:none;box-shadow:0 -3px 18px rgba(0,0,0,.2);font-size:16px}",
      ".ykcx-keyboard.ykcx-visible{display:flex;flex-direction:column}",
      ".ykcx-mode-dock{height:var(--ykcx-height);left:0;right:0;bottom:0;width:100%}",
      ".ykcx-mode-floating{width:min(var(--ykcx-float-width),calc(100vw - 24px));height:min(330px,calc(100vh - 24px));right:18px;bottom:18px;border-radius:8px;overflow:hidden;transform:scale(var(--ykcx-scale));transform-origin:bottom right;box-shadow:0 8px 30px rgba(0,0,0,.34)}",
      ".ykcx-keyboard-header{display:flex;align-items:center;height:44px;min-height:44px;padding:0 8px;border-bottom:1px solid rgba(0,0,0,.09)}",
      ".ykcx-drag-handle,.ykcx-tool-button,.ykcx-candidate{border:0;background:transparent;color:#3c4854;height:36px;min-width:40px;font-size:18px}",
      ".ykcx-drag-handle{cursor:move}",
      ".ykcx-candidates{display:flex;align-items:stretch;gap:2px;overflow-x:auto;flex:1;height:40px;scrollbar-width:none}",
      ".ykcx-candidates::-webkit-scrollbar{display:none}",
      ".ykcx-candidate{padding:0 16px;white-space:nowrap;font-size:19px;border-right:1px solid rgba(0,0,0,.08)}",
      ".ykcx-tools{display:flex;margin-left:auto}",
      ".ykcx-tool-button{font-size:22px;border-radius:4px}",
      ".ykcx-material-icon{display:block;width:24px;height:24px;margin:auto;fill:currentColor;pointer-events:none}",
      ".ykcx-key .ykcx-material-icon{width:26px;height:26px}",
      ".ykcx-composition{display:none;height:24px;padding:2px 18px;color:#1558a6;background:#fff;font-size:15px;border-bottom:1px solid #d5dce3}",
      ".ykcx-composition-visible{display:block}",
      ".ykcx-keys{display:flex;flex-direction:column;flex:1;gap:6px;padding:7px 10px 10px;min-height:0}",
      ".ykcx-key-row{display:flex;justify-content:center;gap:6px;flex:1;min-height:0}",
      ".ykcx-row-1{padding:0 4.5%}.ykcx-row-2{padding:0 1.2%}",
      ".ykcx-key{position:relative;flex:1;min-width:0;border:0;border-radius:5px;background:var(--ykcx-key-bg);color:var(--ykcx-ink);font-size:clamp(16px,2.15vw,24px);box-shadow:0 1px 1px rgba(0,0,0,.3);padding:0;outline:0}",
      ".ykcx-key:active{background:#cbd5df;transform:translateY(1px);box-shadow:none}",
      ".ykcx-key-special{background:#c8d0d8;font-size:18px;max-width:11%}",
      ".ykcx-key-active{background:#fff;color:var(--ykcx-blue)}",
      ".ykcx-key-space{max-width:none;flex:4;font-size:14px;font-weight:500}",
      ".ykcx-key-enter{background:#4f91df;color:#fff;max-width:13%}",
      ".ykcx-key[data-key=language]{display:none;max-width:7%}.ykcx-has-languages .ykcx-key[data-key=language]{display:block}",
      ".ykcx-selection-overlay{display:none;position:fixed;inset:0;z-index:var(--ykcx-z);pointer-events:none;font-family:Roboto,Arial,sans-serif}",
      ".ykcx-selection-visible{display:block}",
      ".ykcx-selection-menu{position:fixed;display:flex;height:44px;border-radius:4px;background:#303136;color:#fff;box-shadow:0 4px 12px rgba(0,0,0,.35);overflow:hidden;pointer-events:auto}",
      ".ykcx-selection-menu:after{content:'';position:absolute;left:50%;bottom:-6px;width:12px;height:12px;background:#303136;transform:translateX(-50%) rotate(45deg)}",
      ".ykcx-selection-action{position:relative;z-index:1;border:0;background:transparent;color:#fff;padding:0 20px;font-size:15px;font-weight:500;letter-spacing:0}",
      ".ykcx-selection-action+ .ykcx-selection-action{border-left:1px solid rgba(255,255,255,.18)}",
      ".ykcx-selection-handle{position:fixed;width:22px;height:22px;margin-left:-11px;background:var(--ykcx-blue);border-radius:50%;pointer-events:auto;touch-action:none}",
      ".ykcx-selection-handle:before{content:'';position:absolute;left:7px;top:-10px;width:8px;height:15px;background:var(--ykcx-blue)}",
      ".ykcx-input-highlight{position:fixed;background:rgba(26,115,232,.28);pointer-events:none}",
      "::selection{background:rgba(26,115,232,.38);color:inherit}",
      ".ykcx-copy-helper{position:fixed!important;left:-9999px!important;top:0!important}",
      "@media(max-height:500px){.ykcx-keyboard-header{height:38px;min-height:38px}.ykcx-keys{gap:4px;padding:5px 8px 7px}.ykcx-key-row{gap:5px}}"
    ].join("");
    doc.head.appendChild(style);
  }

  var listeners = {};
  var adapter;
  var keyboard;
  var selection;

  var api = {
    version: "1.0.0",
    options: null,
    init: function (options) {
      if (keyboard) return api;
      api.options = assign({}, DEFAULT_OPTIONS, options || {});
      injectStyle();
      adapter = new TextAdapter();
      keyboard = new Keyboard(api.options, adapter, api);
      selection = new SelectionController(api.options, adapter, api);
      doc.addEventListener("focusin", function (event) {
        var editable = closestEditable(event.target);
        if (editable && !editable.hasAttribute("data-ykcx-disabled")) keyboard.show(editable);
      });
      doc.addEventListener("selectionchange", function () { adapter.captureRange(); });
      (api._pendingLanguages || []).forEach(function (language) { keyboard.registerLanguage(language); });
      api._pendingLanguages = [];
      api.emit("ready", {});
      return api;
    },
    show: function (element) {
      if (!keyboard) api.init();
      element = element || closestEditable(doc.activeElement);
      if (element) keyboard.show(element);
      return api;
    },
    hide: function () { if (keyboard) keyboard.hide(); return api; },
    setMode: function (mode) { if (!keyboard) api.init(); keyboard.setMode(mode); return api; },
    registerLanguage: function (language) {
      if (keyboard) keyboard.registerLanguage(language);
      else (api._pendingLanguages || (api._pendingLanguages = [])).push(language);
      return api;
    },
    on: function (name, handler) { (listeners[name] || (listeners[name] = [])).push(handler); return api; },
    off: function (name, handler) {
      if (!listeners[name]) return api;
      listeners[name] = listeners[name].filter(function (item) { return item !== handler; });
      return api;
    },
    emit: function (name, detail) {
      (listeners[name] || []).slice().forEach(function (handler) { handler(detail); });
      var event;
      try { event = new CustomEvent("ykcx:" + name, { detail: detail }); }
      catch (error) {
        event = doc.createEvent("CustomEvent");
        event.initCustomEvent("ykcx:" + name, false, false, detail);
      }
      doc.dispatchEvent(event);
    },
    destroy: function () {
      if (keyboard) keyboard.root.remove();
      if (selection) selection.overlay.remove();
      var style = doc.getElementById(STYLE_ID);
      if (style) style.remove();
      doc.documentElement.classList.remove("ykcx-dock-open");
      keyboard = selection = adapter = null;
    }
  };

  global.Ykcx = api;
  if (doc.readyState === "loading") doc.addEventListener("DOMContentLoaded", function () { if (!api.options) api.init(global.YkcxOptions); });
  else api.init(global.YkcxOptions);
})(window);
