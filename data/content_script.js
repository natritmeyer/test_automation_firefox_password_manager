window.addEventListener('add_credentials_to_passman', function(event) {
  self.port.emit('add_credentials_to_passman', event.detail);
}, false);

