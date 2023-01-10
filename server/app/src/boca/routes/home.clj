(ns boca.routes.home
  (:require [compojure.core :refer [defroutes GET]]
            [ring.util.response :refer [resource-response]]
            [boca.views.layout :as layout]))

(defn home []
  (layout/common
    [:div#main-container
     [:h1 "Hello World!"]]))

(defn about []
  (layout/common
    [:div#main-container
     [:h1 [:i "You"] " talk, therefore I am."]
     [:h1 "* * *"]
     [:p "Take off your skin,"]
     [:p "Dive into a spin -"]
     [:p "Gold fish, 'Hello'!"]
     [:p [:a {:href "http://urgh.weebly.com/"} "[IG]"] ", 2008"]]))

(defroutes home-routes
  (GET "/" [] (home))
  (GET "/about" [] (about))
  (GET "/test" [] (resource-response "test.html" {:root "public"}))
  )
