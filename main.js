const channels = [
                { 
                name: "NBT2HD",
                sources: [
                    { 
                        name: "THAI", 
                        url: "https://cri-streamer3.cdn.3bbtv.com:8443/3bb/live/2/2.mpd",
                        type: "dash",
                        drm: {
                            kid: "ca20a93cf8e3421dafbd5bdb1990081b",
                            key: "86ae86a7391c481ea93eecdb740f0a14",
                        }
                    }
                ],
                img: "https://gigatv.3bbtv.co.th/wp-content/themes/changwattana/assets/channel/2.png", 
                category: "Digital TV",
                package: ["150","250","500"],
                description: "THAI News"
              },{ 
                name: "ThaiPBS",
                sources: [
                    { name: "Default", url: "https://thaipbs-ophctt.cdn.byteark.com/live/playlist.m3u8" },
                    { 
                        name: "THAI", 
                        url: "https://cco-streamer1.cdn.3bbtv.com:8443/3bb/live/3/3.mpd",
                        type: "dash",
                        drm: {
                            kid: "4d4426a505f64382a9841155d721cee6",
                            key: "0f4770219ccb4be5836a7517057e51c3",
                        }
                    }
                ],
                img: "https://gigatv.3bbtv.co.th/wp-content/themes/changwattana/assets/channel/3.png", 
                category: "Digital TV",
                package: ["150","250","500"],
                description: "THAI News"
              },{ 
                name: "ALTV",
                sources: [
                    { 
                        name: "THAI", 
                        url: "https://cco-streamer1.cdn.3bbtv.com:8443/3bb/live/4/4.mpd",
                        type: "dash",
                        drm: {
                            kid: "1e98456bcbea44b7ad05831387e364ef",
                            key: "3d14fd4f9d3149a79b35a7124fccbd67",
                        }
                    }
                ],
                img: "https://gigatv.3bbtv.co.th/wp-content/themes/changwattana/assets/channel/4.png", 
                category: "Digital TV",
                package: ["150","250","500"],
                description: "THAI News"
              },{ 
                name: "TV5 HD",
                sources: [
                    { 
                        name: "THAI", 
                        url: "https://cri-streamer3.cdn.3bbtv.com:8443/3bb/live/5/5.mpd",
                        type: "dash",
                        drm: {
                            kid: "87db4361f7894655a4656e9c8b935a02",
                            key: "b025a4b950df41158a87cfc8d6f2ac34"
                        }
                    }
                ],
                img: "https://gigatv.3bbtv.co.th/wp-content/themes/changwattana/assets/channel/5.png", 
                category: "Digital TV",
                package: ["150","250","500"],
                description: "THAI News"
              },{ 
                name: "T Sports 7",
                sources: [
                    { 
                        name: "THAI", 
                        url: "https://cco-streamer1.cdn.3bbtv.com:8443/3bb/live/7/7.mpd",
                        type: "dash",
                        drm: {
                            kid: "6187523f92b9475bb5b192f70cef1342",
                            key: "5119311f482144d58dacabc5bc1fa4ba",
                        }
                    }
                ],
                img: "https://gigatv.3bbtv.co.th/wp-content/themes/changwattana/assets/channel/7.png", 
                category: "Digital TV",
                package: ["150","250","500"],
                description: "THAI News"
              },{ 
                name: "TPTV",
                sources: [
                    { 
                        name: "THAI", 
                        url: "https://cco-streamer1.cdn.3bbtv.com:8443/3bb/live/10/10.mpd",
                        type: "dash",
                        drm: {
                            kid: "5da46688fd1e4ed5b085a12519b9dc4e",
                            key: "fd07bcf33823447180f53f6540f74ccb",
                        }
                    }
                ],
                img: "https://gigatv.3bbtv.co.th/wp-content/themes/changwattana/assets/channel/10.png", 
                category: "Digital TV",
                package: ["150","250","500"],
                description: "THAI News"
              },{ 
                name: "TNN16",
                sources: [
                    { 
                        name: "THAI", 
                        url: "https://cco-streamer1.cdn.3bbtv.com:8443/3bb/live/16/16.mpd",
                        type: "dash",
                        drm: {
                            kid: "9ebedc957e934d2b9023e4e60b97af73",
                            key: "7bcb4363df74457bbafedec1a864e6b6",
                        }
                    }
                ],
                img: "https://gigatv.3bbtv.co.th/wp-content/themes/changwattana/assets/channel/16.png", 
                category: "Digital TV",
                package: ["150","250","500"],
                description: "THAI News"
              },{ 
                name: "",
                sources: [
                    { 
                        name: "THAI", 
                        url: "",
                        type: "dash",
                        drm: {
                            kid: "",
                            key: "",
                        }
                    }
                ],
                img: "", 
                category: "Digital TV",
                package: ["150","250","500"],
                description: "THAI News"
              },
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
