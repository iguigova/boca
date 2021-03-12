(ns icebreaker.routes.home
  (:require [compojure.core :refer [defroutes GET]]
            [ring.util.response :refer [resource-response]]
            [icebreaker.views.layout :as layout]))

(defn home []
  (layout/common
    [:div#main-container
     [:h1 "Hello World!"]]))

(defn about []
  (layout/common
    [:div#main-container
     [:h1 "About Icebreaker"]
     [:h2 "Sub Heading here"]
     [:p "This is some text"]
     [:p "This is some more"]]))

(defroutes home-routes
  (GET "/" [] (home))
  (GET "/about" [] (about))
  (GET  "/test" [] (resource-response "test.html" {:root "public"}))
  )
