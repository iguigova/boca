(ns icebreaker.routes.boca
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

(defn boca []
  (layout/boca))

(defroutes boca-routes
  ;; (GET "/" [] (home))
  ;; (GET "/about" [] (about))
  (GET "/boca/*" [] (boca))
  (GET  "/boca" [] (resource-response "boca.html" {:root "public"}))
  )
