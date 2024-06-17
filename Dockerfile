ARG WATSON_RUNTIME_BASE="cp.icr.io/cp/ai/watson-nlp-runtime:1.0.18"
ARG SENTIMENT_MODEL="cp.icr.io/cp/ai/watson-nlp_sentiment_aggregated-cnn-workflow_lang_en_stock:1.0.6"

# Download and unpack the model
FROM ${SENTIMENT_MODEL} as model1
RUN ./unpack_model.sh

# Download the runtime image
FROM ${WATSON_RUNTIME_BASE} as release

# Copy over the model to the runtime image, which enables it to be used
RUN true && mkdir -p /app/models
ENV LOCAL_MODELS_DIR=/app/models
COPY --from=model1 app/models /app/models
