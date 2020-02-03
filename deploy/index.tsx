import Adapt, { Group, handle } from "@adpt/core";

import { UrlRouter } from "@adpt/cloud/http";
import { NodeService, ReactApp } from "@adpt/cloud/nodejs";
import { Postgres } from "@adpt/cloud/postgres";
import { k8sProdStyle, k8sTestStyle, laptopStyle } from "./styles";

function App() {
    const pg = handle();
    const app = handle();
    const api = handle();

    return <Group>

        <UrlRouter
            port={8080}
            routes={[
                { path: "/api/", endpoint: api },
                { path: "/", endpoint: app }
            ]} />

        <ReactApp handle={app} srcDir="../frontend" />

        <NodeService handle={api} srcDir="../backend" connectTo={pg} />

        <Postgres handle={pg} />

    </Group>;
}

Adapt.stack("default", <App />, laptopStyle);
Adapt.stack("laptop", <App />, laptopStyle);
Adapt.stack("k8s-test", <App />, k8sTestStyle());
Adapt.stack("k8s-prod", <App />, k8sProdStyle());
