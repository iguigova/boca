(ns icebreaker.routes.boca
  (:require [compojure.core :refer [defroutes GET]]
            [ring.util.response :refer [resource-response]]
            [icebreaker.views.layout :as layout]))
 
(defn boca []
  (layout/boca))

(defroutes boca-routes
  (GET "/boca/*" [] (boca))
  (GET "/boca" [] (resource-response "boca.html" {:root "public"}))
  )
