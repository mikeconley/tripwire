const Panel = {
  get $dumpReport() {
    delete this.$dump;
    return this.$dump = document.getElementById("dump-report");
  },

  get $toggle() {
    delete this.$toggle;
    return this.$toggle = document.getElementById("toggle");
  },

  get $controls() {
    delete this.$controls;
    return this.$controls = document.getElementById("controls");
  },

  get $sound() {
    delete this.$sound;
    return this.$sound = document.getElementById("sound");
  },

  init() {
    this.$dumpReport.addEventListener("click", this);
    this.$toggle.addEventListener("click", this);
    this.$sound.addEventListener("change", this);
    browser.runtime.sendMessage({ name: "get-state" }).then((state) => {
      let { enabled, sound } = state;
      this.$controls.setAttribute("enabled", enabled);
      this.$toggle.checked = enabled;
      this.$sound.checked = sound;
    });
  },

  handleEvent(event) {
    switch(event.originalTarget.id) {
      case "dump-report": {
        browser.runtime.sendMessage({ name: "dumpReport"});
        window.close();
        break;
      }

      case "toggle": {
        let enabled = event.originalTarget.checked;
        browser.runtime.sendMessage({ name: "toggle", enabled });
        this.$controls.setAttribute("enabled", enabled);
        break;
      }

      case "sound": {
        let enabled = event.originalTarget.checked;
        browser.runtime.sendMessage({ name: "sound", enabled });
        break;
      }
    }
  },
}


addEventListener("load", function() {
  Panel.init();
});
