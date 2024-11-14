// Modified, based on https://gist.github.com/udayvunnam/a58c2a1c3044853c9d9efdc3c74e559e
class Node {
  constructor(key, value, next = null, prev = null) {
    this.key = key;
    this.value = value;
    this.next = next;
    this.prev = prev;
  }
}

class LRUCache {
  constructor(limit = 100) {
    this.size = 0;
    this.limit = limit;
    this.head = null;
    this.tail = null;
    this.cacheMap = {};
  }

  put(key, value) {
    const existingNode = this.cacheMap[key];
    let evicted = null;
    if (existingNode) {
      this.delete(existingNode);
      this.size--;
    } else if (this.size === this.limit) {
      evicted = this.delete(this.tail.key, true);
      this.size--;
    }

    if (!this.head) {
      this.head = this.tail = new Node(key, value);
    } else {
      const node = new Node(key, value, this.head);
      this.head.prev = node;
      this.head = node;
    }

    this.cacheMap[key] = this.head;
    this.size++;
    return evicted;
  }

  get(key) {
    const existingNode = this.cacheMap[key];
    if (existingNode) {
      const value = existingNode.value;
      if (this.head !== existingNode) {
        this.put(key, value);
      }
      return value;
    }
    return null;
  }

  delete(key, returnDeletedNode) {
    let node = this.cacheMap[key];
    if (!node) {
      return null;
    }
    delete this.cacheMap[key];

    if (node.prev !== null) {
      node.prev.next = node.next;
    } else {
      this.head = node.next;
    }

    if (node.next !== null) {
      node.next.prev = node.prev;
    } else {
      this.tail = node.prev;
    }
    return (returnDeletedNode) ? node : null;
  }

  clear() {
    this.head = null;
    this.tail = null;
    this.size = 0;
    this.cacheMap = {};
  }
}

module.exports = { LRUCache };
