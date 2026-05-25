const CACHE_NAME = "ussd-pay-v2.5";

const FILES = [

  "/USSD/",
  "/USSD/index.html",
  "/USSD/settings.html",
  "/USSD/offline.html",

  "/USSD/style.css",
  "/USSD/script.js",

  "/USSD/manifest.json",

  "/USSD/icons/logo.png",
  "/USSD/icons/icon-192.png",
  "/USSD/icons/icon-512.png",
  "/USSD/icons/maskable-512.png"

];

// Install

self.addEventListener(
"install",
event=>{

    self.skipWaiting();

    event.waitUntil(

        caches.open(
            CACHE_NAME
        )

        .then(cache=>{

            return cache.addAll(
                FILES
            );

        })

    );

}
);

// Activate

self.addEventListener(
"activate",
event=>{

    event.waitUntil(

        caches.keys()

        .then(keys=>{

            return Promise.all(

                keys.map(key=>{

                    if(
                        key !== CACHE_NAME
                    ){

                        return caches.delete(
                            key
                        );

                    }

                })

            );

        })

    );

    self.clients.claim();

}
);

// Fetch

self.addEventListener(
"fetch",
event=>{

    if(
        event.request.method !==
        "GET"
    ){
        return;
    }

    event.respondWith(

        fetch(event.request)

        .then(response=>{

            const clone =
            response.clone();

            caches.open(
                CACHE_NAME
            )

            .then(cache=>{

                cache.put(
                    event.request,
                    clone
                );

            });

            return response;

        })

        .catch(()=>{

            return caches.match(
                event.request
            )

            .then(response=>{

                return (

                    response ||

                    caches.match(
                        "/USSD/offline.html"
                    )

                );

            });

        })

    );

});