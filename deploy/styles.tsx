import Adapt, { concatStyles, Style } from "@adpt/core";

import { Service, ServiceProps } from "@adpt/cloud";
import { ServiceContainerSet } from "@adpt/cloud/docker";
import { HttpServer, HttpServerProps, UrlRouter, UrlRouterProps } from "@adpt/cloud/http";
import { makeClusterInfo, ServiceDeployment } from "@adpt/cloud/k8s";
import * as nginx from "@adpt/cloud/nginx";
import { Postgres, PostgresProvider, TestPostgres } from "@adpt/cloud/postgres";

/*
 * Style rules common to all style sheets
 */
export const commonStyle =
    <Style>
        {HttpServer}
        {Adapt.rule<HttpServerProps>(({ handle, ...props }) => <nginx.HttpServer {...props} />)}

        {UrlRouter}
        {Adapt.rule<UrlRouterProps>(({ handle, ...props }) => <nginx.UrlRouter {...props} />)}
    </Style>;

/*
 * Laptop testing style - deploys to local Docker host
 */
export const laptopStyle = concatStyles(
    commonStyle,
    <Style>
        {Postgres}
        {Adapt.rule(() =>
            <TestPostgres mockDbName="test_db" mockDataPath="./test_db.sql" />)}

        {Service}
        {Adapt.rule<ServiceProps>(({ handle, ...props }) =>
            <ServiceContainerSet dockerHost={process.env.DOCKER_HOST} {...props} />)}
    </Style>);

const testPodProps = {
    // Terminate containers quickly in test environments
    podProps: { terminationGracePeriodSeconds: 0 }
};

/*
 * Kubernetes testing style
 */
export async function k8sTestStyle() {
    const config = await clusterInfo();
    return concatStyles(
        commonStyle,
        <Style>
            {Postgres}
            {Adapt.rule(() =>
                <TestPostgres mockDbName="test_db" mockDataPath="./test_db.sql" />)}

            {Service}
            {Adapt.rule<ServiceProps>(({ handle, ...props }) =>
                <ServiceDeployment config={config} {...props} {...testPodProps} />)}
        </Style>
    );
}

/*
 * Kubernetes production style
 */
export async function k8sProdStyle() {
    const config = await clusterInfo();
    return concatStyles(
        commonStyle,
        <Style>
            {Postgres}
            {Adapt.rule(() =>
                /*
                 * Update host, database, and pguser with your production values.
                 * Don't forget to set PGPASSWORD when using adapt run/update (e.g.,
                 * PGPASSWORD=<secret> adapt run k8s-prod --deployID production)
                 */
                <PostgresProvider
                    host="myhost.com:5432"
                    database="mydatabase"
                    user="dbuser"
                    /* DO NOT HARDCODE PASSWORD HERE SINCE YOU WILL PROBABLY COMMIT THIS FILE TO GIT!! */
                    password={process.env.PGPASSWORD} />)}

            {Service}
            {Adapt.rule<ServiceProps>(({ handle, ...props }) =>
                <ServiceDeployment config={config} {...props} />)}
        </Style>
    );
}

export async function clusterInfo() {
    return makeClusterInfo({ registryUrl: process.env.KUBE_DOCKER_REPO || undefined });
}
