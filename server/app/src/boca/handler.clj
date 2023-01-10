(ns boca.handler
  (:require [compojure.core :refer [defroutes routes GET]]
            [ring.middleware.resource :refer [wrap-resource]]
            [ring.middleware.file-info :refer [wrap-file-info]]
            [ring.middleware.reload :as reload]
            [org.httpkit.server :refer [run-server]]
            [hiccup.middleware :refer [wrap-base-url]]
            [compojure.handler :as handler]
            [compojure.route :as route]
            [boca.routes.home :refer [home-routes]]
            [boca.routes.boca :refer [boca-routes]]
            [boca.routes.json :refer [json-routes]]            
            [boca.routes.websockets :refer [websocket-routes]]
            [boca.environment :as environment]
            )
  (:gen-class))

(defn init []
  (println "boca is starting"))

(defn destroy []
  (println "boca is shutting down"))

(defroutes app-routes
  (route/resources "/")
  ;; (route/files "/public")  
  (route/not-found "Not Found"))

(def E (environment/context))

(def final-routes
  (if (:production E)
    (routes home-routes boca-routes json-routes websocket-routes app-routes)
    (routes #'home-routes #'boca-routes #'json-routes #'websocket-routes #'app-routes)))

(def app
  (-> final-routes
      (handler/site)
      (wrap-base-url)))

(defn -main [& args]
  (let [handler (if (:production E) app (reload/wrap-reload #'app))]    
    (println "server started at port" (:port E))
    (run-server handler {:port (:port E)})))
