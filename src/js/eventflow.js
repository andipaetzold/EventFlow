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
                $("<img>", {alt: "image" + id, src: data.data}).appendTo(item);
                break;
            case "text":
                $("<p></p>").text(data.data).appendTo(item);
                break;
        }

        $("div#feed").prepend(item);
    });

    // post event - text
    $("#post-text form").submit(function()
    {
        var textBox = $("input[type=text]", this);
        ref.child("feed").push({data: textBox.val(), type: "text"});
        textBox.val("");

        return false;
    });
});
