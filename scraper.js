var url = require('url') ;
var request = require('request');
var ajax = require('ajax-request');
var cheerio = require('cheerio');
var Krawler = require('krawler');
var http = require('http');
var fs = require('fs');

var downloadDatasheet = function (collection  , num  ) {
    console.log("Downloading ... " ) ;
    if (Number(num)) {
        s = 1 ;
        for (var ic in collection) {
            if (s == num){
                ajax.download(
                        "http://www.nxp.com" + collection[ic] ,
                    function(err, res, body, filepath) {
                        console.log("Downloading " + ic + " to " + filepath);
                    }
                );
            }
            s++ ;
        }
    }
    else {
        for (var ic in collection) {
            ajax.download(
//                {rootPath : "http://www.nxp.com" ,url : collection[ic] ,destPath : "/documents/" + ic } ,
                    "http://www.nxp.com" + collection[ic] ,
                function(err, res, body, filepath) {
                    console.log("Downloading " + ic + " to " + filepath);
                }
            ).done(function () {
                    console.log("!!!!!!")
                });
        }
    }
}
console.log("############### DIGITAL CIRCUIT IC SCRAPER ###############") ;
console.log("#########################################################") ;
console.log("")
var runApp = function() {
    console.log("OPTIONS : ")
    console.log("1) Search") ;
    console.log("2) Quit") ;
        var prompt = require('prompt');
        prompt.start();
        prompt.get(['Option'], function (err, result) {
            if (result.Option == 1 ) {
                prompt.start()
                console.log("Enter the Ic name you are looking for , and the number of results  : ")

                prompt.get(["icName" , "count"] , function (err, result) {
                    console.log("Scraping data sheet .. ") ;
                    var krawler = new Krawler ;
                    var count = result.count || 10  ;
                    var dataSheets = {  }
                    var link = [ "http://www.nxp.com/search?pcon%5B%5D=Data+sheet&rows=" + result.count.toString() + "&type=keyword&q=" + result.icName.replace(" " , "+") + "&page=1&tab=Documents&filterChanged=pcon%5B%5D" ]

                    krawler.queue(link)
                        .on('data' , function ($, url, resp) {
                            $('table.standard tbody tr').each(function () {
                                if ($(this).children('td').children('a').text() in dataSheets ) {
                                    var duplacte = 0 ;
                                    for (var name in dataSheets) {
                                        if ( name ==$(this).children('td').children('a').text() ) {duplacte ++ ;}
                                    }
                                    dataSheets[$(this).children('td').children('a').text() +"_" + duplacte.toString()] = $(this).children('td').children('a').attr('href') ;
                                }
                                else {
                                    dataSheets[$(this).children('td').children('a').text()] = $(this).children('td').children('a').attr('href') ;
                                }

                            })
                        })
                        .on('error', function(err, url) {
                            console.log(err) ;
                        })
                        .on('end' , function () {
                            console.log("Scraping finished .");
                            console.log("RESULTS :: ")
                            var c = 1 ;
                            for (var i in dataSheets) {
                                console.log(c.toString() + ") " + i ) ;
                                c ++ ;
                            }
                            console.log("==> Enter the number of the gate that you want to download , enter 0 to download all ") ;
                            prompt.start() ;
                            prompt.get(["Index"] , function (err, result) {
                                downloadDatasheet(dataSheets , result.Index) ;
                            })

                        })

                })
            }
            else {
                process.exit() ;
            }
        }) ;
}

runApp()