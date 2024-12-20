// package zellosdk.example

// import com.facebook.react.ReactActivity
// import com.facebook.react.ReactActivityDelegate
// import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
// import com.facebook.react.defaults.DefaultReactActivityDelegate

// class MainActivity : ReactActivity() {

//   /**
//    * Returns the name of the main component registered from JavaScript. This is used to schedule
//    * rendering of the component.
//    */
//   override fun getMainComponentName(): String = "ZelloSdkExample"

//   /**
//    * Returns the instance of the [ReactActivityDelegate]. We use [DefaultReactActivityDelegate]
//    * which allows you to enable New Architecture with a single boolean flags [fabricEnabled]
//    */
//   override fun createReactActivityDelegate(): ReactActivityDelegate =
//       DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled)
// }
package zellosdk.example

import android.view.KeyEvent
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate
import com.facebook.react.modules.core.DeviceEventManagerModule

class MainActivity : ReactActivity() {

    override fun getMainComponentName(): String = "ZelloSdkExample"

    override fun createReactActivityDelegate(): ReactActivityDelegate =
        DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled)

    override fun dispatchKeyEvent(event: KeyEvent): Boolean {
        if (event.action == KeyEvent.ACTION_DOWN) {
            val reactContext = reactInstanceManager.currentReactContext
            reactContext?.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                ?.emit("KeyEvent", event.keyCode) // Send keycode to React Native
        }
        return super.dispatchKeyEvent(event)
    }
}
