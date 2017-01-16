// run on document ready
$(function() {

    // the "href" attribute of .modal-trigger must specify the modal ID that wants to be triggered
    $('.modal').modal();

	// add the click handler for the login button
	$(".article-table").on("click", ".article-save", function() {

		event.preventDefault();

		if ($(this).text() == "Saved") {return};

		console.log("Clicked " + $(this).attr("article-ndx"));

		var ndx = parseInt($(this).attr("article-ndx"));
		var articleInfo = $(".article-table tr:eq("+ndx+")").find("a.article-link");
		var link = articleInfo.prop("href");
		var title = articleInfo.text();
		console.log(`link is ${link}`);
		console.log(`title is ${title}`);

		$.ajax({
			url: "/articles/new",
			method: "POST",
			data: { type: "Article", title: title, link: link }
		}).then( function(response) {
			console.log(`title is ${response.title}`);
			console.log(`link is ${response.link}`);
			console.log(`_id is ${response._id}`);
			var btnSave = $(".article-table tr:eq("+ndx+")").find("a.article-save");
			btnSave.text("Saved");
			btnSave.removeClass("waves-effect waves-light").addClass("disabled");
			$("#save-confirm-article-title").text(`"${response.title}"`);
			$("#add-article-comment").attr("article-id", response._id);
			$('#modal1').modal('open');
		})

	});

	$("#add-article-comment").on("click", function() {

		event.preventDefault();

		console.log(`add a comment for ${$(this).attr("article-id")}`);

		$("#add-comment-article-title").text($("#save-confirm-article-title").text());
		$("#comment-save").attr("article-id", $(this).attr("article-id"));

		// close the article added modal
		$('#modal1').modal('close');

		// show the add comment modal and set focus to the input field
		$('#add-comment-modal').modal('open');
		$("#comment-text").focus();

	});

	$("#comment-save").on("click", function() {

		event.preventDefault();

		console.log(`save a comment for ${$(this).attr("article-id")}`);
		console.log($("#comment-text").val());

		$.ajax({
			url: "/articles/new",
			method: "POST",
			data: { type: "Comment", comment: $("#comment-text").val(), articleId: $(this).attr("article-id") }
		}).then( function(response) {
			console.log(`comment is ${response.comment}`);
			console.log(`articleId is ${response.articleId}`);

			$('#add-comment-modal').modal('close');

		})

	});

});