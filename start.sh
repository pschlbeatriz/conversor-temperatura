#!/bin/bash
# Usado pelo terraform/aws-deploy.tf: instala dependências e sobe o
# conversor na porta 80 (porta liberada pelo security group / load balancer).
npm ci
npx --yes serve web -l 80
