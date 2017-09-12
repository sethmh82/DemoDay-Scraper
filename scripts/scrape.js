// SCRAPE SCRIPT

var request = require("request");
var cheerio = require("cheerio");
var wordpress = require("wordpress");
var fs = require("fs");




/////////////////////////////////
// UPLOAD FILES
/*
var filename = "aurora-borealis.jpg";
var file = fs.readFileSync( filename );
client.uploadFile({
	name: filename,
	type: "image/jpg",
	bits: file
}, function( error, data ) {
	console.log( arguments );
});
*/


/////////////////////////////////
// NEW POST W META DATA
/*
client.newPost({
	title: "My Second Post",
	content: "Publishing to WordPress from node.js sure is fun!",
	status: "publish",
	termNames: {
		"category": ["Javascript", "Node"],
		"post_tag": ["api", "fun", "js"]
	}
}, function( error, data ) {
	console.log( arguments );
});
*/



// CONNECT TO WORDPRESS
var wordpress = require("wordpress");
var client = wordpress.createClient({
  url: "setheditor.com",
  username: "admin",
  password: "pass"
});


// NEW POST
/*
client.newPost({
  title: "My First Post",
  content: "Controlling WordPress from node.js sure is fun!"
}, function (error, data) {
  console.log(arguments);
});
*/

/*
var scrapeWP = function (wpcb) {

  client.newPost({
  title: "Pushed",
  content: "article" + wpArticles
}, function (error, data) {
  console.log(arguments);
});
};
*/



var scrape = function (cb, wpcb) {

  // https://www.statista.com/topics/2539/social-sharing/
  // https://www.statista.com/topics/1839/retail-in-china/
  // 
  // 
  request("https://www.statista.com/topics/1839/retail-in-china/", function (err, res, body) {


    var $ = cheerio.load(body);

    var articles = [];
    var wpArticles = [];

    var theSpacer = {
      headline: "NEW ARTICLE",
      summary: "-----------------------------------------------------"
    };
    articles.push(theSpacer);

    var thePage = {
      headline: "------  https://www.statista.com/topics/1839/retail-in-china/ ------",
      summary: "Retail In China --------"
    };
    articles.push(thePage);

    $(".topfactBox__factWrapper").each(function (i, element) {

      // var $a = $(element).next();
      // var $div = $a.next();
      // var $picture = $div.next();
      // var imgURL = $picture.next('img').attr('src');
      //var header = $(element).find(".vertical-feed-article-header").text().trim();
      //var desc = $(element).find(".vertical-feed-article-description").text().trim();

      var header = $(element).find(".topfactBox__key").text().trim();
      var desc = $(element).find(".topfactBox__value").text().trim();

      if (header && desc) {

        // TRIM OFF EXTRAS
        var headNeat = header.replace(/(\r\n|\n|\r|\t|\s+)/gm, " ").trim();
        var sumNeat = desc.replace(/(\r\n|\n|\r|\t|\s+)/gm, " ").trim();


        // NORMALIZE BILLION
        if (sumNeat.includes("bn") && sumNeat.includes("$") && sumNeat.includes(",")) {
          var sum1 = sumNeat.replace("bn", "");
         // console.log(sum1); // $10,982.83
          var sumD1 = sum1.replace(".", "");
        //  console.log(sumD1); // $10,98283
          var sumD = sumD1.replace(",", ".");
       //   console.log(sumD); // $10.98283
          var sumS = sumD.replace("$", "");
       //   console.log(sumS); // 10.98283
          var sum2 = parseFloat(Math.round(sumS * 1000000000)).toFixed(0).toString();
       //   console.log(sum2); // 10982830000
          var sum3 = sum2.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
          console.log(sum3); // 10,982,830,000

          console.log(sumNeat); 
          // TO MONGO DB
          var dataToAdd = {
            headline: headNeat,
            summary: sumNeat
          };

           // TO WORDPRESS
          var wpDataToAdd = ("<tr><td>" + headNeat + "</td><td>" + "$ " + sum3 + "</td></tr>");

        wpArticles.push(wpDataToAdd);
        articles.push(dataToAdd);

        } // END IF
        ///////////////////////////////////////

/*
        // CONVERT AND NORMALIZE CHINESE YEN TO USD
        // CONVERSION RATE 13 YEN TO 1 USD
        if (sumNeat.includes("tn") && sumNeat.includes("CN¥") && sumNeat.includes(",")) {
          var sum1 = sumNeat.replace("tn", "");
          console.log(sum1); // $10,982.83
          var sumD1 = sum1.replace(".", "");
          console.log(sumD1); // $10,98283
          var sumD = sumD1.replace(",", ".");
          console.log(sumD); // $10.98283
          var sumS = sumD.replace("CN¥", "");
          console.log(sumS); // 10.98283
          var sum2 = parseFloat(Math.round(sumS * 1000000000000) * .13).toFixed(0).toString();
          console.log(sum2); // 10982830000
          var sum3 = sum2.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
          console.log(sum3); // 10,982,830,000

          // TO MONGO DB
          var dataToAdd = {
            headline: headNeat,
            summary: sumNeat
          };
          
          // TO WORDPRESS
          var wpDataToAdd = ("<tr><td>" + headNeat + "</td><td>" + "CN¥ " + sum3 + "</td></tr>");

        } // END IF

        */
        ///////////////////////////////////////

        // IF NO CONVERSIONS FOUND THEN
         else {
          var dataToAdd = {
            headline: headNeat,
            summary: sumNeat
          };
          var wpDataToAdd = ("<tr><td>" + headNeat + "</td><td>" + sumNeat + "</td></tr>");

        wpArticles.push(wpDataToAdd);
        articles.push(dataToAdd);


        } // END IF
        ///////////////////////////////////////


        } // END (header && desc) IF

    

    }); // COMPLETE $(".topfactBox__factWrapper")


    // NOW CREATE WORDPRESS POST

    var finalWP = (wpArticles.join("")); // COMBINE ARRAY FOR WORDPRESS

    console.log(finalWP); // CONSOLE LOG THE WP CONTENT

    client.newPost({
      title: "Pushed",
      content: "<table>" + finalWP + "</table>",
      status: "draft",
      termNames: {
        "category": "Finacnial",
        "post_tag": ["Financial, China"]
      }
    }, function (error, data) {
      console.log(arguments);
    });

    cb(articles); // CALLBACK ARTICLES

  });

}; // END SCRAPE FUNCTION

module.exports = scrape;
