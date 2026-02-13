const channels = [
               {
                name: "BBC News", 
                sources: [
                    { name: "UK", url: "https://tplay.live/out/news/bbc-news/index.m3u8" },
                    { name: "Asia", url: "https://cdn4.skygo.mn/live/disk1/BBC_News/HLSv3-FTA/BBC_News.m3u8" }
                ], 
                img: "https://i.postimg.cc/s2679ZP4/bbc.jpg", 
                category: "News",
                package: ["150","250","500"],
                description: "World News"
             },
            { 
                name: "CNN",
                sources: [
                    { 
                        name: "USA", 
                        url: "https://qp-pldt-live-grp-12-prod.akamaized.net/out/u/dr_cnnhd.mpd",
                        type: "dash",
                        drm: {
                            kid: "900c43f0e02742dd854148b7a75abbec",
                            key: "da315cca7f2902b4de23199718ed7e90"
                        }
                    }
                ],
                img: "https://play-lh.googleusercontent.com/375NW5yL8owK_hW9igW9sh-YJbda9ZcygpDXuVvK_R7l-yJp-fuhb4qvUw_FE4XW4ms", 
                category: "News",
                package: ["150","250","500"],
                description: "World News"
            },
              { 
                name: "Test", 
                sources: [
                    { 
                        name: "Auto", 
                        url: "https://zap-live1-ott.izzigo.tv/4/out/u/dash/NICKMUSICSD/default.mpd",
                        type: "dash",
                        drm: {
                            kid: "96c869392d2e908eaf78a9fcfa8c3107",
                            key: "cd307966418dafe8fa5e673f8c172f39"
                        }
                    }
                ], 
                img: "https://i.ibb.co.com/pf4SxjC/knbc.png", 
                category: "Sports",
                description: "World"
            },
        ];
