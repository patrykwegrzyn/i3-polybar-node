const i3 = require('i3').createClient();
const polybar = require('./polybar');

let tabs = [];
let title;
let active;
let activeWorkspace = [];

i3.on('workspace', onWorkspace);

i3.on('window', w => {
  //console.log(JSON.stringify(w))
  const { change, container } = w;
  const { id, output, window_properties, fullscreen_mode } = container;
  const wp = window_properties;
  console.log('window ', change);
  active = id;
  title = wp.class + ' - ' + wp.title;
  if (w.change == 'title' && active !== id) return;
  polybar[fullscreen_mode ? 'hide' : 'show'](output)

  if (change === 'new') {
    tabs.push(container);
  }

  if (change === 'close') {
    tabs = tabs.filter(w => w.id !== container.id);
  }

  polybar.hook('title', 1, output);
  if (change === 'focus') {
    polybar.hook('tabs', 1, output);
  }
});

function findNodes(arr, result) {
  if (arr.length === 0) return;
  arr.forEach(n => {
    const { id, name, nodes } = n;
    if (!!n.name) {
      result.push({ id, name });
    }
    findNodes(nodes, result);
  });
}

function onWorkspace(e) {
  activeWorkspace = [];
  const { change, current, old } = e;
  console.log('worksace', change);
  if (!current) return;

  const event = change;
  const { output, nodes } = current;

  if (event === 'focus' && nodes.length > 0) {
    findNodes(nodes, activeWorkspace);
    tabs = nodes[0].nodes.map(n => {
      const { id, name } = n;
      return { id, name };
    });
  }
  if (['empty', 'init'].includes(change)) {
    title = ' ';
    polybar.hook('title', 1, output);
  }
}

//let titleFormated = "%{F$colors.green}" + title + "%{F-}"

exports.getTabs = () => {
  return tabs
    .map((t, i) => {
      const index = i + 1;
      return t.id === active ? `[${index}]` : index;
    })
    .join(' ');
};

exports.getTitle = () => title;

exports.cycleWindows = mode => {
  const size = activeWorkspace.length;
  if (size === 0) return;

  const index = activeWorkspace.findIndex(e => e.id === active);
  let nextIndex = index + (mode == 1 ? 1 : -1);
  if (nextIndex > size - 1) {
    nextIndex = 0;
  }

  if (nextIndex < 0) {
    nextIndex = size - 1;
  }

  const id = activeWorkspace[nextIndex].id;

  i3.command(`[con_id="${id}"] focus`);
};
