/*
 * PHARMACY C++ ENGINE — High Performance Module
 * Compile: g++ -std=c++17 -fopenmp -O3 -o build/pharmacy_engine src/backend/engine/pharmacy_engine.cpp
 */

#include <iostream>
#include <vector>
#include <string>
#include <unordered_map>
#include <algorithm>
#include <chrono>
#include <omp.h>
#include <cmath>

using namespace std;
using namespace std::chrono;

struct Drug {
    int id; string code; string name; string generic;
    int stock; float price; int reorder_level; string expiry_date;
    bool is_controlled; int category_id;
};

struct Interaction {
    int drug_a; int drug_b; string severity; string description;
};

class PharmacyEngine {
private:
    vector<Drug> drugs;
    unordered_map<int, vector<Interaction>> interaction_graph;
public:
    void load_drugs(const vector<Drug>& drug_list) {
        drugs = drug_list;
        cout << "[Engine] Loaded " << drugs.size() << " drugs." << endl;
    }
    void load_interactions(const vector<Interaction>& interactions) {
        for (const auto& inter : interactions) {
            interaction_graph[inter.drug_a].push_back(inter);
            interaction_graph[inter.drug_b].push_back(inter);
        }
        cout << "[Engine] Loaded " << interactions.size() << " interactions." << endl;
    }

    vector<Drug> analyze_low_stock() {
        vector<Drug> low_stock;
        #pragma omp parallel
        {
            vector<Drug> local;
            #pragma omp for nowait
            for (size_t i = 0; i < drugs.size(); i++) {
                if (drugs[i].stock <= drugs[i].reorder_level) local.push_back(drugs[i]);
            }
            #pragma omp critical
            { low_stock.insert(low_stock.end(), local.begin(), local.end()); }
        }
        return low_stock;
    }

    vector<Drug> analyze_expiring(const string& cutoff_date) {
        vector<Drug> expiring;
        #pragma omp parallel
        {
            vector<Drug> local;
            #pragma omp for nowait
            for (size_t i = 0; i < drugs.size(); i++) {
                if (drugs[i].expiry_date <= cutoff_date) local.push_back(drugs[i]);
            }
            #pragma omp critical
            { expiring.insert(expiring.end(), local.begin(), local.end()); }
        }
        sort(expiring.begin(), expiring.end(), [](const Drug& a, const Drug& b) { return a.expiry_date < b.expiry_date; });
        return expiring;
    }

    vector<Interaction> check_interactions(const vector<int>& drug_ids) {
        vector<Interaction> found;
        unordered_map<int, bool> drug_set;
        for (int id : drug_ids) drug_set[id] = true;
        #pragma omp parallel for
        for (size_t i = 0; i < drug_ids.size(); i++) {
            auto it = interaction_graph.find(drug_ids[i]);
            if (it != interaction_graph.end()) {
                for (const auto& inter : it->second) {
                    if (drug_set.find(inter.drug_b) != drug_set.end()) {
                        #pragma omp critical
                        found.push_back(inter);
                    }
                }
            }
        }
        return found;
    }

    float calculate_total_value() {
        float total = 0.0f;
        #pragma omp parallel for reduction(+:total)
        for (size_t i = 0; i < drugs.size(); i++) total += drugs[i].stock * drugs[i].price;
        return total;
    }

    vector<Drug> search_drugs(const string& term) {
        vector<Drug> results;
        string lower_term = term;
        transform(lower_term.begin(), lower_term.end(), lower_term.begin(), ::tolower);
        #pragma omp parallel
        {
            vector<Drug> local;
            #pragma omp for nowait
            for (size_t i = 0; i < drugs.size(); i++) {
                string ln = drugs[i].name, lg = drugs[i].generic;
                transform(ln.begin(), ln.end(), ln.begin(), ::tolower);
                transform(lg.begin(), lg.end(), lg.begin(), ::tolower);
                if (ln.find(lower_term) != string::npos || lg.find(lower_term) != string::npos)
                    local.push_back(drugs[i]);
            }
            #pragma omp critical
            { results.insert(results.end(), local.begin(), local.end()); }
        }
        return results;
    }
};

int main() {
    cout << "========================================" << endl;
    cout << "PHARMACY C++ ENGINE v6.0" << endl;
    cout << "Threads: " << omp_get_max_threads() << endl;
    cout << "========================================" << endl;

    PharmacyEngine engine;
    vector<Drug> test_drugs;
    vector<string> names = {"Paracetamol","Amoxicillin","Ibuprofen","Aspirin","Cetirizine"};

    auto start = high_resolution_clock::now();
    for (int i = 0; i < 50000; i++) {
        Drug d; d.id = i+1; d.code = "DRG-" + to_string(i+1);
        d.name = names[i%5] + " " + to_string((i%5+1)*100) + "mg";
        d.stock = rand() % 200; d.price = 5.0f + (rand() % 100);
        d.reorder_level = 20 + (rand() % 30);
        int y = 2026 + (rand() % 2), m = 1 + (rand() % 12), day = 1 + (rand() % 28);
        d.expiry_date = to_string(y) + "-" + (m<10?"0":"") + to_string(m) + "-" + (day<10?"0":"") + to_string(day);
        test_drugs.push_back(d);
    }
    engine.load_drugs(test_drugs);

    vector<Interaction> interactions;
    interactions.push_back({1, 4, "severe", "Increased bleeding risk"});
    interactions.push_back({2, 3, "moderate", "Stomach irritation"});
    engine.load_interactions(interactions);

    // Benchmarks
    start = high_resolution_clock::now();
    auto low = engine.analyze_low_stock();
    auto t1 = duration_cast<microseconds>(high_resolution_clock::now() - start).count();

    start = high_resolution_clock::now();
    auto exp = engine.analyze_expiring("2026-12-31");
    auto t2 = duration_cast<microseconds>(high_resolution_clock::now() - start).count();

    start = high_resolution_clock::now();
    auto conflicts = engine.check_interactions({1, 4});
    auto t3 = duration_cast<microseconds>(high_resolution_clock::now() - start).count();

    start = high_resolution_clock::now();
    float value = engine.calculate_total_value();
    auto t5 = duration_cast<microseconds>(high_resolution_clock::now() - start).count();

    start = high_resolution_clock::now();
    auto search = engine.search_drugs("Para");
    auto t6 = duration_cast<microseconds>(high_resolution_clock::now() - start).count();

    cout << "\nPERFORMANCE (50,000 drugs):" << endl;
    cout << "Low Stock:     " << t1 << " μs (" << low.size() << " found)" << endl;
    cout << "Expiry:        " << t2 << " μs (" << exp.size() << " found)" << endl;
    cout << "Interactions:  " << t3 << " μs (" << conflicts.size() << " found)" << endl;
    cout << "Total Value:   " << t5 << " μs ($" << value << ")" << endl;
    cout << "Search:        " << t6 << " μs (" << search.size() << " found)" << endl;
    cout << "========================================" << endl;
    return 0;
}
