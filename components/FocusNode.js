import styles from './FocusNode.module.css';

export default function FocusNode({ focusedNode, setFocusedNode }) {
    return(
        <div className={styles.container} style={{
          width: '500px',
          maxHeight: '300px',
          position: 'fixed',
          top: '20px',
          right: '20px',
          padding: '10px',
          background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.5) 0%, rgba(206, 223, 255, 0.5) 52.5%, rgba(0, 85, 255, 0.15) 100%)',
          backdropFilter: 'blur(8px)',
          boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)',
          border: '1px solid #ddd',
          borderRadius: '3px',
          zIndex: 10
        }}>
          <h3>
          <a href={`https://en.wikipedia.org/wiki/${focusedNode.id}`}>{focusedNode.data.title || "Untitled"}</a>
          </h3>
          <p>{focusedNode.data.content || "No content available"}</p>
          <button onClick={() => setFocusedNode(null)}>Close</button>
        </div>
    )
}