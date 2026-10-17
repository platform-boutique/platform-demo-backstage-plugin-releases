# Releases plugin

<div class="pd-hero" markdown>
<span class="pd-kicker">backstage plugin · releases</span>

A change reaches the cluster in four steps: a **tag** on the service repository, a signed **image**, a **pull request** that
declares the new digest in the Helm repository, and **Argo CD** rolling it out. This plugin shows where each service is on that
path, and whether what *runs* is what the repository *declares*.
</div>

<div class="pd-facts" markdown>
<div><span>Adds</span><strong>Releases tab</strong><small>on entities with an Argo CD application</small></div>
<div><span>Adds</span><strong>Releases page</strong><small>every application, every environment</small></div>
<div><span>Reads</span><strong>Argo CD</strong><small>Application status, via the Kubernetes API</small></div>
<div><span>Reads</span><strong>Helm repository</strong><small>image.digest of each environment</small></div>
</div>

## The states

| State | Meaning | What to do |
|---|---|---|
| <span class="pd-pill pd-pill--ok">running what is declared</span> | The digest that runs equals the digest in `envs/<env>/values/<app>.yaml` | Nothing |
| <span class="pd-pill pd-pill--warn">rolling out</span> | They differ and Argo CD is syncing or the pods are not healthy yet | Wait; if it lasts, look at the Argo CD tab |
| <span class="pd-pill pd-pill--no">differs from declared</span> | They differ and nothing is happening | Argo CD may be paused or failing to sync; open the application |
| <span class="pd-pill">no digest declared</span> | The values file has no digest, or the application has no image (gateway, monitoring) | Expected for add-ons |
| <span class="pd-pill">not deployed</span> | Argo CD reports no images | The application is missing or empty |

## Latest release

The entity tab also shows the newest `vX.Y.Z` tag of the repository (from the GitHub API, using the integration's token when
there is one). When GitHub cannot be reached the card says so; nothing else on the page depends on it.

!!! info "Not covered yet"
    Open promotion pull requests ("v1.2.0 is released, a PR to promote it is open") and mapping a running digest back to the tag it
    was built from need the GitHub API with a token and the registry's tag list. They are the obvious next step.
