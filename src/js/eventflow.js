$(function()
{
    var ref = new Firebase("https://scorching-fire-2873.firebaseio.com");

    // load options
    ref.child("options").on("value", function(options)
    {
        options = options.val();

        // set title and meta data
        $("head title").html(options.title);
        $("head meta[name=description]").attr("content", options.description);
        $("head meta[name=keywords]").attr("content", options.keywords);
        $("head meta[name=author]").attr("content", options.author);
    }, function(e)
    {
        console.error(e.code);
    });

    // load feed
    ref.child("feed").on("child_added", function(snapshot, prev)
    {
        id   = snapshot.key();
        data = snapshot.val();

        item = $("<div></div>");
        switch(data.type)
        {
            case "image":
                $("<img>", {alt: "image" + id, src: data.src}).appendTo(item);
                break;
            case "text":
                $("<p></p>").text(data.text).appendTo(item);
                break;
        }

        $("div#feed").prepend(item);
    });
});