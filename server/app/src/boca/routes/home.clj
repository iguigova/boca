(ns boca.routes.home
  (:require [compojure.core :refer [defroutes GET]]
            [ring.util.response :refer [resource-response]]
            [boca.views.layout :as layout]))

(defn home []
  (layout/common
   [:div#right-container
    [:a#about-link {:href "/about" :class "fa-solid fa-address-card"}]]
   [:div#main-container
    [:h1 "Hello World!"]]))

(defn about []
  (layout/common
   [:div#right-container
    [:h4 "Boca Source Files: " [:a {:href "https://github.com/iguigova/boca"} "https://github.com/iguigova/boca"]]
    ]
   [:div#main-container
    [:h1 [:i "You"] " talk, therefore I am."]
    [:img#logo {:src "images/boca.png"}]
    ]
   [:div#right-container
    [:p "Take off your skin,"]
    [:p "Dive into a spin -"]
    [:p "Gold fish, 'Hello'!"]
    [:p [:a {:href "http://urgh.weebly.com/"} "[IG]"]]
    
    ]))

(defroutes home-routes
  (GET "/" [] (home))
  (GET "/about" [] (about))
  (GET "/test" [] (resource-response "test.html" {:root "public"}))
  )
