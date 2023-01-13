(ns boca.views.layout
  (:require [hiccup.page :refer [html5 include-css]]))

(defn common [& body]
  (html5
    [:head
     [:title "Welcome to boca"]
     (include-css "/css/common.css")]
     (include-css "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.2.1/css/all.min.css")
    [:body body]))

(defn boca []
  (html5
   [:head
    [:title "Boca"]
    [:meta {:name "viewport" :content "width=device-width, initial-scale=1"}]
    (include-css "/css/boca.css")
    (include-css "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.2.1/css/all.min.css")]
   [:body
    [:div#root]
    [:script {:type "text/javascript" :src "https://unpkg.com/react@18/umd/react.production.min.js"}]
    [:script {:type "text/javascript" :src "https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"}]
    [:script {:type "text/javascript" :src "https://unpkg.com/dompurify/dist/purify.min.js"}]

    [:script {:type "module" :src "/dist/boca.js"}]])
  )
