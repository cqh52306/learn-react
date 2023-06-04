import { createContainer } from "react-reconciler/src/ReactFiberReconciler";

function ReactDOMRoot(internalRoot) {
  this._internalRoot = internalRoot;
}

export function createRoot(container) {
  // div#root
  const root = createContainer(container);
  console.log(root);
  return new ReactDOMRoot(root);
}
