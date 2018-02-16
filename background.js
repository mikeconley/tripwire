function violationListener(stack) {
  Tripwire.violation(stack);
}

const Tripwire = {
  violationLog: new Set(),

  _enabled: false,
  set enabled(val) {
    if (val) {
      browser.tripwire.onViolation.addListener(violationListener);
    } else {
      browser.tripwire.onViolation.removeListener(violationListener);
    }
    this._enabled = val;
    this.saveState();
    return this._enabled;
  },

  get enabled() {
    return this._enabled;
  },

  sound: false,

  saveState() {
    let state = {
      enabled: this.enabled,
      sound: this.sound,
    };

    browser.storage.local.set({ state });
  },

  init(state, signatureStuff) {
    browser.runtime.onMessage.addListener(this.messageListener.bind(this));
    debugger;

    if (state.enabled) {
      this.toggle(true);
    }

    this.sound = !!state.sound;
    this.sigData = [];
    this.loadSigData(signatureStuff);
  },

  commandListener(command) {
    switch (command) {
      case "Toggle": {
        this.toggle(!this.enabled);
        break;
      }
      case "DumpReport": {
        this.dumpReport();
        break;
      }
    }
  },

  messageListener(msg, sender, sendReply) {
    switch(msg.name) {
      case "get-violations": {
        sendReply([...this.violationLog]);
        break;
      }
      case "get-signature-data": {
        sendReply(this.sigData);
        break;
      }
      case "reset": {
        this.reset();
        break;
      }
      case "get-state": {
        sendReply({
          enabled: this.enabled,
          sound: this.sound,
        });
        break;
      }
      case "toggle": {
        this.toggle(msg.enabled);
        break;
      }
      case "sound": {
        this.sound = msg.enabled;
        break;
      }
      case "dumpReport": {
        this.dumpReport();
        break;
      }
    }
  },

  violation(stack) {
    this.violationLog.add(stack.join("\n"));
    if (this.sound) {
      this.playSound();
    }
    this.updateBadge();
    console.log("There are: " + this.violationLog.size + " recorded violations");
  },

  reset() {
    this.violationLog = new Set();
    this.updateBadge();
  },

  toggle(enabled) {
    if (this.enabled != enabled) {
      this.enabled = enabled;
      let iconSuffix = this.enabled ? "on" : "off";
      let path = `icons/toolbar_${iconSuffix}.png`;
      browser.browserAction.setIcon({ path });
      this.updateBadge();
    }
  },

  dumpReport() {
    browser.tabs.create({
      url: "/content/report.html",
    });
  },

  _playTimer: null,
  _soundObj: new Audio("/sounds/sonar-sweep.mp3"),
  playSound() {
    if (this._playTimer) {
      clearTimeout(this._playTimer);
    }
    this._playTimer = setTimeout(() => {
      this._soundObj.play();
      this._playTimer = null;
    }, 500);
  },

  updateBadge() {
    let text = this.enabled ? this.violationLog.size.toString() : "";
    browser.browserAction.setBadgeText({ text });
  },

  loadSigData(signatureStuff) {
    this.sigData = [];

    for (let sigEntry of signatureStuff.data) {
      let bugs = sigEntry.bugs;
      let signatures = sigEntry.signatures;
      this.sigData.push({ bugs, signatures });
    }
  },
}

browser.storage.local.get("state").then(result => {
  window.fetch("docs/signatures.json").then((response) => {
    response.json().then((sigs) => {
      Tripwire.init(result.state || {}, sigs);
    });
  });
});