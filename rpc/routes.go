package rpc

import (
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/go-chi/chi"
)

func routesV1(rpc *RPC) chi.Router {
	r := chi.NewRouter()

	r.Get("/gas/price", func(w http.ResponseWriter, r *http.Request) {
		suggestedGasPrice, err := rpc.SuggestedGasPrice(r.Context())
		if err != nil {
			respondJSON(w, err)
			return
		}
		respondJSON(w, suggestedGasPrice)
	})

	r.Get("/gas/history/suggested", func(w http.ResponseWriter, r *http.Request) {
		c := uint(20)
		history, err := rpc.AllSuggestedGasPrices(r.Context(), &c)
		if err != nil {
			respondJSON(w, err)
			return
		}
		respondJSON(w, history)
	})

	r.Get("/gas/history/actual", func(w http.ResponseWriter, r *http.Request) {
		c := uint(20)
		history, err := rpc.AllGasStats(r.Context(), &c)
		if err != nil {
			respondJSON(w, err)
			return
		}
		respondJSON(w, history)
	})

	return r
}

func respondJSON(w http.ResponseWriter, data interface{}) {
	w.Header().Set("content-type", "application/json")

	if err, ok := data.(error); ok {
		w.WriteHeader(422)
		w.Write([]byte(fmt.Sprintf(`{err:"%s"}`, err.Error())))
		return

	} else {
		payload, err := json.Marshal(data)
		if err != nil {
			w.WriteHeader(422)
			w.Write([]byte(fmt.Sprintf(`{err:"%s"}`, err.Error())))
			return
		}

		w.WriteHeader(200)
		w.Write([]byte(payload))
	}
}
