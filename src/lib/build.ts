export const buildInfo = {
  version: typeof __APP_VERSION__ === 'undefined' ? 'test' : __APP_VERSION__,
  commit: typeof __APP_COMMIT__ === 'undefined' ? 'test' : __APP_COMMIT__,
  repoUrl:
    typeof __REPO_URL__ === 'undefined'
      ? 'https://github.com/baditaflorin/hostflow-local'
      : __REPO_URL__,
  paypalUrl:
    typeof __PAYPAL_URL__ === 'undefined'
      ? 'https://www.paypal.com/paypalme/florinbadita'
      : __PAYPAL_URL__,
}
