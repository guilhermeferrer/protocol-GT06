FROM rabbitmq:3.8-management

# RUN apt-get update && apt-get install -y curl unzip

# RUN curl https://github.com/rabbitmq/rabbitmq-delayed-message-exchange/archive/v3.8.0.zip > rabbitmq_delayed_message_exchange.v3.8.0.zip && mv rabbitmq_delayed_message_exchange.v3.8.0.zip /opt/rabbitmq/plugins/

# RUN unzip /opt/rabbitmq/plugins/rabbitmq_delayed_message_exchange.v3.8.0.zip

ADD ./rabbitmq_delayed_message_exchange-3.8.0.ez /opt/rabbitmq/plugins/rabbitmq_delayed_message_exchange-3.8.0.ez

RUN rabbitmq-plugins enable rabbitmq_delayed_message_exchange