import { useEffect, useState } from 'react';

function InstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [visible, setVisible] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    const userAgent = window.navigator.userAgent.toLowerCase();
    const ios = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(ios);

    console.log("Is iOS:", ios);

    const handler = (e) => {
      e.preventDefault();
      console.log("beforeinstallprompt event fired");
      setDeferredPrompt(e);
      setVisible(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const choiceResult = await deferredPrompt.userChoice;
    console.log('User choice:', choiceResult.outcome);
    setDeferredPrompt(null);
    setVisible(false);
  };

  console.log("Visible:", visible, "DeferredPrompt:", deferredPrompt);

  if (!visible && !isIOS) return null;

  return (
    <div className="install-container">
      {isIOS && (
        <div className="install-btn ios-instruction">
          <p className="help-text">To install this app on your iPhone:</p>
          <p className="help-text">Click the Share icon at bottom and select "Add to Home Screen".</p>
        </div>
      )}
      {visible && (
        <button onClick={handleInstall} className="install-btn">
          Install App
        </button>
      )}
    </div>
  );
}

export default InstallButton;
