const passwords = require("passwords");
const prefs = require("preferences-service");
const urls = require("url");
const data = require("self").data;

var test_automation_password_manager = {
  add_credentials : function(url, username, password) {
    passwords.store({
      url: url,
      realm: url,
      username: username,
      password: password,
      onError: function onError(error) {
        if(error.message.indexOf("This login already exists") == -1) {
          console.log(error.message)
        }
      }
    });
    var url_host = urls.URL(url).host;
    this.add_trusted_uri(url_host);
  },

  add_trusted_uri : function(trusted_uri) {
    var trusted_uris_prefs_name = "network.automatic-ntlm-auth.trusted-uris";
    var original_trusted_uris = "";
    if(prefs.isSet(trusted_uris_prefs_name)) {
      original_trusted_uris = prefs.get(trusted_uris_prefs_name) + ",";
    }
    var trusted_uris = original_trusted_uris + trusted_uri;
    prefs.set(trusted_uris_prefs_name, trusted_uris);
  },
};

var pageMod = require('page-mod').PageMod({
  include: ['*'],
  contentScriptFile: data.url("content_script.js"),
  onAttach: function(worker) {
    worker.port.on('add_credentials_to_passman', function(message) {
      test_automation_password_manager.add_credentials(message.host, message.username, message.password);
    });
  }
});

