var auth = (function($, undefined)
{
    var options = {
        ref: null,

        login:  null,
        logout: null
    };

    // config
    var config = function(o)
    {
        $.extend(options, o);

        options.ref.onAuth(function(authData)
        {
            (authData ? options.login : options.logout)();
        });
    };

    // login
    var login = function(email, password)
    {
        options.ref.authWithPassword({
            email: email,
            password: password
        }, function(error)
        {
            if (error) alert("Invalid Login");
        });
    };

    // logout
    var logout = function()
    {
        options.ref.unauth();
    };

    return {
        config: config,

        login:  login,
        logout: logout
    };
})(jQuery);
