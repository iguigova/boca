(ns icebreaker.handler
  (:require [compojure.core :refer [defroutes routes]]
            [ring.middleware.resource :refer [wrap-resource]]
            [ring.middleware.file-info :refer [wrap-file-info]]
            [ring.middleware.reload :as reload]
            [org.httpkit.server :refer [run-server]]
            [hiccup.middleware :refer [wrap-base-url]]
            [compojure.handler :as handler]
            [compojure.route :as route]
            [icebreaker.routes.home :refer [home-routes]]
            [icebreaker.routes.websockets :refer [websocket-routes]]
            [icebreaker.environment :as environment]
            ))

(defn init []
  (println "icebreaker is starting"))

(defn destroy []
  (println "icebreaker is shutting down"))

(defroutes app-routes  
  (route/resources "/")
  (route/files "/public")
  (route/not-found "Not Found"))

(def app
  (-> (routes home-routes websocket-routes app-routes)
      (handler/site)
      (wrap-base-url)))

(defn -main [& args]
  (let [{:keys [production port]} (environment/context)
        handler (if production app (reload/wrap-reload #'app))]    
    (println "server started at port" port)
    (run-server handler {:port port})))
