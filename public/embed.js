(function () {
  "use strict";

  var config = window.OpenClawEmbed || {};
  var agentId = config.agentId || "default";
  var baseUrl = config.baseUrl || window.location.origin;
  var position = config.position || "bottom-right";
  var theme = config.theme || "light";
  var title = config.title || "Chat with AI";
  var primaryColor = config.primaryColor || "#3b82f6";
  var width = config.width || "380px";
  var height = config.height || "520px";

  var isOpen = false;

  // Create styles
  var style = document.createElement("style");
  style.textContent = [
    ".oc-widget-btn{position:fixed;z-index:9999;width:56px;height:56px;border-radius:50%;border:none;cursor:pointer;box-shadow:0 4px 12px rgba(0,0,0,0.15);display:flex;align-items:center;justify-content:center;transition:transform 0.2s,box-shadow 0.2s}",
    ".oc-widget-btn:hover{transform:scale(1.05);box-shadow:0 6px 20px rgba(0,0,0,0.2)}",
    ".oc-widget-btn svg{width:24px;height:24px;fill:white}",
    ".oc-widget-frame{position:fixed;z-index:9998;border:none;border-radius:16px;box-shadow:0 8px 32px rgba(0,0,0,0.12);overflow:hidden;transition:opacity 0.2s,transform 0.2s;opacity:0;transform:translateY(10px);pointer-events:none}",
    ".oc-widget-frame.oc-open{opacity:1;transform:translateY(0);pointer-events:auto}",
    position === "bottom-right"
      ? ".oc-widget-btn{bottom:24px;right:24px}.oc-widget-frame{bottom:92px;right:24px}"
      : ".oc-widget-btn{bottom:24px;left:24px}.oc-widget-frame{bottom:92px;left:24px}",
  ].join("\n");
  document.head.appendChild(style);

  // Create button
  var btn = document.createElement("button");
  btn.className = "oc-widget-btn";
  btn.style.backgroundColor = primaryColor;
  btn.innerHTML =
    '<svg viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/></svg>';
  btn.setAttribute("aria-label", "Open chat");
  document.body.appendChild(btn);

  // Create iframe
  var iframe = document.createElement("iframe");
  iframe.className = "oc-widget-frame";
  iframe.style.width = width;
  iframe.style.height = height;
  iframe.src = baseUrl + "/chat/" + encodeURIComponent(agentId) + "?embed=1&theme=" + theme;
  iframe.setAttribute("title", title);
  document.body.appendChild(iframe);

  btn.addEventListener("click", function () {
    isOpen = !isOpen;
    if (isOpen) {
      iframe.classList.add("oc-open");
      btn.innerHTML =
        '<svg viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>';
    } else {
      iframe.classList.remove("oc-open");
      btn.innerHTML =
        '<svg viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/></svg>';
    }
  });
})();
