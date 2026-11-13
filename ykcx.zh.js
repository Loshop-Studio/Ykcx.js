(function (global) {
  "use strict";

  var doc = global.document;
  var pluginScript = doc.currentScript;
  var options = global.YkcxZhOptions || {};
  var state = {
    input: "",
    context: null,
    data: global.YkcxZhDictionary || null,
    syllables: null,
    prefixes: null,
    loading: false,
    failed: false
  };

  function dictionaryUrl() {
    if (options.dictionaryUrl) return options.dictionaryUrl;
    var source = pluginScript && pluginScript.src;
    if (!source) return "ykcx.zh.dict.js";
    return source.replace(/ykcx\.zh(?:\.min)?\.js(?:[?#].*)?$/, "ykcx.zh.dict.js");
  }

  function buildIndexes() {
    if (!state.data || state.syllables) return;
    state.syllables = {};
    state.prefixes = {};
    (state.data.syllables || []).forEach(function (syllable) {
      state.syllables[syllable] = true;
      for (var i = 1; i <= syllable.length; i += 1) state.prefixes[syllable.slice(0, i)] = true;
    });
  }

  function loadDictionary() {
    if (state.data) {
      buildIndexes();
      return;
    }
    if (state.loading) return;
    state.loading = true;
    var script = doc.createElement("script");
    script.src = dictionaryUrl();
    script.async = true;
    script.onload = function () {
      state.data = global.YkcxZhDictionary;
      state.loading = false;
      state.failed = !state.data;
      buildIndexes();
      if (state.context) update(state.context);
    };
    script.onerror = function () {
      state.loading = false;
      state.failed = true;
      if (state.context) update(state.context);
    };
    (doc.head || doc.documentElement).appendChild(script);
  }

  function lookup(syllables) {
    if (!state.data) return [];
    return state.data.entries[syllables.join(" ")] || [];
  }

  function segmentPart(input) {
    var length = input.length;
    var best = new Array(length + 1);
    best[0] = { count: 0, lengths: [], syllables: [] };
    for (var i = 0; i < length; i += 1) {
      if (!best[i]) continue;
      for (var size = 1; size <= Math.min(6, length - i); size += 1) {
        var syllable = input.slice(i, i + size);
        if (!state.syllables[syllable]) continue;
        var end = i + size;
        var candidate = {
          count: best[i].count + 1,
          lengths: best[i].lengths.concat(size),
          syllables: best[i].syllables.concat(syllable)
        };
        if (!best[end] || betterSegmentation(candidate, best[end])) best[end] = candidate;
      }
    }
    if (best[length]) return { syllables: best[length].syllables, tail: "" };
    for (var position = length - 1; position >= 0; position -= 1) {
      if (best[position]) {
        var tail = input.slice(position);
        return { syllables: best[position].syllables, tail: tail };
      }
    }
    return { syllables: [], tail: input };
  }

  function betterSegmentation(left, right) {
    if (left.count !== right.count) return left.count < right.count;
    for (var i = 0; i < left.lengths.length; i += 1) {
      if (left.lengths[i] !== right.lengths[i]) return left.lengths[i] > right.lengths[i];
    }
    return false;
  }

  function segment(raw) {
    var input = raw.toLowerCase().replace(/ü/g, "v").replace(/u:/g, "v").replace(/\s+/g, "");
    if (!input || !state.syllables) return { syllables: [], tail: input };
    var parts = input.split("'");
    var result = [];
    var tail = "";
    for (var i = 0; i < parts.length; i += 1) {
      if (!parts[i]) continue;
      var current = segmentPart(parts[i]);
      result = result.concat(current.syllables);
      if (current.tail) {
        if (i === parts.length - 1) tail = current.tail;
        else result.push(current.tail);
      }
    }
    return { syllables: result, tail: tail };
  }

  function firstEntry(syllables) {
    var entries = lookup(syllables);
    return entries.length >= 2 ? { text: entries[0], freq: entries[1] } : null;
  }

  function compose(syllables) {
    if (!state.data || !syllables.length) return null;
    var length = syllables.length;
    var dp = new Array(length + 1);
    dp[length] = { score: 0, words: [], minFreq: 2147483647 };
    for (var i = length - 1; i >= 0; i -= 1) {
      var best = null;
      for (var end = i + 1; end <= Math.min(length, i + 8); end += 1) {
        var entry = firstEntry(syllables.slice(i, end));
        if (!entry || !dp[end]) continue;
        var score = Math.log(entry.freq) - state.data.logTotal + dp[end].score;
        if (!best || score > best.score) {
          best = {
            score: score,
            words: [entry.text].concat(dp[end].words),
            minFreq: Math.min(entry.freq, dp[end].minFreq)
          };
        }
      }
      dp[i] = best;
    }
    if (!dp[0]) return null;
    return { text: dp[0].words.join(""), freq: dp[0].minFreq };
  }

  function getCandidates(input, limit) {
    if (!state.data) return [];
    var parsed = segment(input);
    var syllables = parsed.syllables;
    var output = [];
    var seen = {};

    function push(text, consumed, freq, kind) {
      if (!text || seen[text]) return;
      seen[text] = true;
      output.push({ text: text, consumed: consumed, freq: freq || 0, kind: kind || "word" });
    }

    if (syllables.length >= 2) {
      var sentence = compose(syllables);
      if (sentence) push(sentence.text, syllables.length, sentence.freq, "sentence");
    }

    for (var count = syllables.length; count > 0; count -= 1) {
      var entries = lookup(syllables.slice(0, count));
      for (var index = 0; index < entries.length; index += 2) {
        push(entries[index], count, entries[index + 1], count > 1 ? "word" : "char");
        if (output.length >= 200) break;
      }
    }

    if (!syllables.length && parsed.tail) {
      var possible = [];
      state.data.syllables.forEach(function (syllable) {
        if (syllable.indexOf(parsed.tail) !== 0) return;
        var entries = lookup([syllable]);
        for (var i = 0; i < Math.min(entries.length, 6); i += 2) {
          possible.push({ text: entries[i], freq: entries[i + 1] });
        }
      });
      possible.sort(function (a, b) { return b.freq - a.freq; });
      possible.slice(0, limit).forEach(function (item) { push(item.text, 0, item.freq, "char"); });
    }

    output.sort(function (a, b) {
      if (a.kind === "sentence" && b.kind !== "sentence") return -1;
      if (b.kind === "sentence" && a.kind !== "sentence") return 1;
      return b.consumed - a.consumed || b.freq - a.freq;
    });
    return output.slice(0, limit);
  }

  function consume(candidate) {
    var parsed = segment(state.input);
    var remain = parsed.syllables.slice(candidate.consumed);
    state.input = remain.join("") + parsed.tail;
  }

  function update(context) {
    state.context = context;
    context.setComposition(state.input);
    if (!state.data) {
      context.setCandidates([state.failed ? "词库加载失败" : "词库加载中…"], function () {});
      loadDictionary();
      return;
    }
    var list = getCandidates(state.input, options.candidateLimit || 20);
    context.setCandidates(list.map(function (item) { return item.text; }), function (text, index) {
      var selected = list[index];
      if (!selected) return;
      context.insertText(selected.text);
      consume(selected);
      update(context);
    });
  }

  function commitFirst(context) {
    if (!state.input) return;
    var first = getCandidates(state.input, 1)[0];
    context.insertText(first ? first.text : state.input);
    if (first) consume(first);
    else state.input = "";
    if (state.input) {
      var rest = getCandidates(state.input, 1)[0];
      context.insertText(rest ? rest.text : state.input);
    }
    state.input = "";
    update(context);
  }

  var plugin = {
    id: "zh-pinyin",
    label: "中文",
    init: function (context) { state.context = context; loadDictionary(); },
    activate: function (context) { update(context); },
    onKey: function (key, context) {
      if (/^[a-z]$/.test(key)) {
        state.input += key;
        update(context);
        return true;
      }
      if (key === "backspace" && state.input) {
        state.input = state.input.slice(0, -1);
        update(context);
        return true;
      }
      if ((key === "space" || key === "enter") && state.input) {
        commitFirst(context);
        return true;
      }
      if ((key === "comma" || key === "period") && state.input) {
        commitFirst(context);
        context.insertText(key === "comma" ? "，" : "。");
        return true;
      }
      return false;
    },
    commit: function (context) {
      commitFirst(context);
    }
  };

  function register() {
    if (!global.Ykcx) return false;
    global.Ykcx.registerLanguage(plugin);
    return true;
  }

  loadDictionary();
  if (!register()) {
    var attempts = 0;
    var timer = global.setInterval(function () {
      attempts += 1;
      if (register() || attempts > 100) global.clearInterval(timer);
    }, 50);
  }
})(window);
