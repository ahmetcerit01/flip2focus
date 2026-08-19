import FamilyControls
import SwiftUI

struct ActivityPickerSheet: View {
    @State private var selection: FamilyActivitySelection
    let onDone: (FamilyActivitySelection) -> Void

    init(initialSelection: FamilyActivitySelection, onDone: @escaping (FamilyActivitySelection) -> Void) {
        _selection = State(initialValue: initialSelection)
        self.onDone = onDone
    }

    var body: some View {
        NavigationView {
            FamilyActivityPicker(selection: $selection)
                .navigationTitle("Block Distracting Apps")
                .navigationBarTitleDisplayMode(.inline)
                .toolbar {
                    ToolbarItem(placement: .confirmationAction) {
                        Button("Done") {
                            onDone(selection)
                        }
                    }
                }
        }
    }
}
