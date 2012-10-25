# Test Automation Firefox Password Manager

A very basic Firefox plugin that allows updating the Password Manager at
runtime using Javascript. When used in concert with the AuthoAuth
plugin (https://addons.mozilla.org/en-US/firefox/addon/autoauth/ ),
ActiveDirectory authentication dialogs will no longer cause your
tests to fail.

## Why it's awesome

Until this plugin arrived, it has been impossible to dynamically add
passwords to Firefox's Password Manager at runtime. This prevents using
Firefox for testing websites that authenticate against ActiveDirectory.
There are work arounds (as documented here: http://watirmelon.com/2012/06/27/automatic-firefox-authentication-when-using-selenium-webdriver-with-autoauth/ ) but you are then stuck with the burden of having to maintain
a Firefox profile. Now, instead, you can go back to using dynamically
created profiles at runtime and by calling a simple javascript function
you can add as many host/username/password combinations as you like.

## Why it's rubbish

Javascript can only be injected and executed into a page that has already
been loaded. This is frustrating because you can only update the Password
Manager once the first page has loaded. The implications of this are
that you need to first navigate to a page that doesn't present a
password prompt, update the Password Manager from that page and only
then should you navigate to the page that presents the password prompt.
I'd love for someone to replace this plugin with something that doesn't
require this extra step.

## How to use it

(NB: the following examples demonstrate how to use this plugin
with capybara and ruby but the principles should carry across to
anything else that can inject javascript into Firefox at runtime)

### Download the plugins

First, you'll need to download `test-automation-password-manager.xpi` from
https://addons.mozilla.org/en-us/firefox/addon/test-automation-password-ma/,
and you'll also need to download the latest AutoAuth plugin file
(`autoauth-2.1-fx+fn.xpi` at time of writing) from
https://addons.mozilla.org/en-US/firefox/addon/autoauth/ . Add both of
them to a directory in your test project called `ff_plugins`.

Direct links here:

* [Test Automation Firefox Password Manager](https://addons.mozilla.org/firefox/downloads/file/170858/test_automation_password_manager-0.1-fx.xpi)
* [AutoAuth](https://addons.mozilla.org/firefox/downloads/latest/4949/addon-4949-latest.xpi)

### Add the plugins to a dynamically created Firefox profile

When you create your Firefox Profile at runtime, you'll need to add this
plugin and the AutoAuth plugin:

```ruby
Capybara.register_driver :selenium_firefox do |app|
  #create the profile:
  profile = Selenium::WebDriver::Firefox::Profile.new

  #add the 2 plugins
  profile.add_extension(File.expand_path("ff_plugins/autoauth-2.1-fx+fn.xpi"))
  profile.add_extension(File.expand_path("ff_plugins/test-automation-password-manager.xpi"))

  Capybara::Selenium::Driver.new(app, :browser => :firefox, :profile => profile)
end
```

### Update Password Manager

The following code shows how to add details to the Password Manager at
runtime:

```ruby
#navigate to a page that won't prompt you for a password:
visit 'http://www.google.com'

#create the javascript that will send the relevant details to the password manager:
pass_man_update_script = <<-SCRIPT
var addCredentialsEvent = new CustomEvent("add_credentials_to_passman", {
  detail: {
    host: 'http://secure.example.com',
    username: 'bob',
    password: 'P45sword'
  }
});
window.dispatchEvent(addCredentialsEvent);
SCRIPT

#inject the script into the browser:
page.execute_script pass_man_update_script

#navigate to the page that prompts you for a password:
visit 'http://super_secure.example.com' 
#This used to present a password dialog that would cause the test to
#fail, but now it doesn't! Woo!
```

## Disclaimer

* I am not a javascript dev
* I am not a Firefox Addon dev
* I only tested this against my current set up as I don't have anything else to test it against
* I developed it against Firefox 15.0.1 and haven't tested it against anything else

Please feel free to send me pull requests, or even better, make a better
version of this plugin. The sooner I can retire this, the happier I'll be.

